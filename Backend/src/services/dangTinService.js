const mongoose = require('mongoose');
const CONFIG = require('../config');
const portal = require('../utils/anhaiPortal');
const DangTinItem = require('../models/DangTinItem');
const { truncate, normalizeTitle, titlesMatch } = require('../utils/text');
const { prepareCover } = require('../utils/coverImage');

// ============================================================
// Tự động đăng tin: anhai.danang.gov.vn → bài viết Zalo OA An Hải (chỉ TẠO, không broadcast).
// Port từ THUONGDUC/frontend/DangTin (articleSync.js + documentSync.js), giữ các bài học đã gặp:
//   - Đánh dấu "đã gửi" + lưu ngay theo TỪNG bài tạo thành công (chống tạo trùng).
//   - Chống trùng theo cả ID lẫn tiêu đề; bỏ qua bài cũ hơn DANGTIN_MAX_AGE_DAYS.
//   - Dry-run (DANGTIN_SEND_ENABLED=false) KHÔNG đánh dấu "đã gửi" — nếu không, khi bật gửi thật
//     các bài đã dry-run sẽ bị bỏ qua vĩnh viễn.
// Chạy trong process server (startDangTin) để dùng chung token Zalo; scripts/dangtin-sync.js
// chỉ chạy dry-run.
// ============================================================

const DAY_MS = 24 * 60 * 60 * 1000;
const DETAIL_CONCURRENCY = 4;

let running = false;
// Dry-run trong server: nhớ trong RAM các khoá đã log / đã xét để không log lại + tải lại chi tiết
// mỗi 10 phút. Không ghi DB nên bật gửi thật (restart) là mất, đúng yêu cầu.
const dryRunSeen = new Set();

function isDbReady() {
  return mongoose.connection.readyState === 1;
}

// Trạng thái 1 lượt chạy: khoá đã xử lý trong DB + đánh dấu (chỉ ghi DB khi gửi thật)
async function loadState({ sendEnabled }) {
  const keys = new Set(sendEnabled ? [] : dryRunSeen);
  if (isDbReady()) {
    const docs = await DangTinItem.find({}, 'key').lean();
    docs.forEach((d) => keys.add(d.key));
  } else if (sendEnabled) {
    throw new Error('Chưa kết nối MongoDB — không thể chạy gửi thật (không lưu được trạng thái chống trùng)');
  }

  return {
    has: (key) => keys.has(key),
    async mark(key, data) {
      keys.add(key);
      if (!sendEnabled) {
        dryRunSeen.add(key);
        return;
      }
      await DangTinItem.updateOne({ key }, { $setOnInsert: { key, ...data } }, { upsert: true });
    },
  };
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return out;
}

function toArticleItem(d) {
  const fullText = d.contentText || d.summary || d.title;
  return {
    title: truncate(d.title.replace(/\s+/g, ' ').trim(), 140),
    author: d.author && d.author.length <= 50 ? d.author : undefined,
    description: truncate((d.summary || fullText).replace(/\s+/g, ' '), 250),
    bodyText: `${fullText}\n\nNguồn: ${d.url}`,
    coverPhotoUrl: d.imageUrl || CONFIG.DANGTIN_DEFAULT_COVER_URL || undefined,
  };
}

function toDocumentItem(doc) {
  const title = doc.epitomize ? `${doc.codeId}: ${doc.epitomize}` : doc.codeId;
  return {
    title: truncate(title, 140),
    description: truncate(doc.epitomize || doc.codeId, 250),
    bodyText: `${doc.epitomize}\n\nSố ký hiệu: ${doc.codeId}\nNgày ban hành: ${doc.issuedText}\nXem văn bản: ${doc.url}`,
    coverPhotoUrl: CONFIG.DANGTIN_DEFAULT_COVER_URL || undefined,
  };
}

// Bỏ bài OA đã có (người/hệ thống khác đăng). oaTitles = null khi không đọc được OA (chỉ xảy ra ở dry-run).
async function skipExistingOnOa(state, entries, oaTitles, { keyOf, titleOf }) {
  if (!oaTitles) return entries;
  const kept = [];
  for (const e of entries) {
    const title = titleOf(e);
    if (oaTitles.some((t) => titlesMatch(t, title))) {
      await state.mark(keyOf(e), { reason: 'exists_on_oa', title, sourceUrl: e.url });
      console.log(`[DangTin] Bỏ qua bài OA đã có sẵn: "${title}"`);
    } else {
      kept.push(e);
    }
  }
  return kept;
}

async function syncArticles(state, { sendEnabled, zalo, oaTitles }) {
  const groups = new Set(CONFIG.DANGTIN_ARTICLE_GROUPS.split(',').map((s) => s.trim()).filter(Boolean));
  const links = (await portal.getRecentArticleLinks()).filter((l) => !groups.size || groups.has(l.group));
  const unseen = links.filter((l) => !state.has(`article:${l.key}`));

  const details = (await mapLimit(unseen, DETAIL_CONCURRENCY, async (link) => {
    try {
      return await portal.getArticleDetail(link);
    } catch (err) {
      console.warn(`[DangTin] Không lấy được chi tiết bài ${link.url}: ${err.message}`);
      return null;
    }
  })).filter(Boolean);

  const now = Date.now();
  const maxAgeMs = CONFIG.DANGTIN_MAX_AGE_DAYS * DAY_MS;
  const recent = [];
  const tooOld = [];
  for (const d of details) {
    if (!d.title || !d.postedAt) {
      console.warn(`[DangTin] Bỏ qua bài thiếu tiêu đề/ngày đăng (có thể trang đổi giao diện): ${d.url}`);
    } else if (now - d.postedAt.getTime() > maxAgeMs) {
      tooOld.push(d);
    } else {
      recent.push(d);
    }
  }
  // Bài cũ (khối nổi bật/gợi ý cố định trên trang chủ) → đánh dấu luôn để không tải lại mỗi lượt
  for (const d of tooOld) {
    await state.mark(`article:${d.key}`, { reason: 'too_old', title: d.title, sourceUrl: d.url });
  }
  if (tooOld.length) {
    console.log(`[DangTin] Bỏ qua ${tooOld.length} bài cũ hơn ${CONFIG.DANGTIN_MAX_AGE_DAYS} ngày: `
      + tooOld.map((d) => d.nid).join(', '));
  }

  // Chống trùng theo TIÊU ĐỀ: 1 bài gắn nhiều chuyên mục xuất hiện với nhiều group/nid khác nhau
  const seenTitles = new Set();
  const unique = [];
  for (const d of recent) {
    const norm = normalizeTitle(d.title);
    if (state.has(`title:${norm}`) || seenTitles.has(norm)) {
      await state.mark(`article:${d.key}`, { reason: 'duplicate_title', title: d.title, sourceUrl: d.url });
      console.log(`[DangTin] Bỏ qua bài trùng tiêu đề với bài đã tạo: ${d.nid} "${d.title}"`);
    } else {
      seenTitles.add(norm);
      unique.push(d);
    }
  }

  const fresh = await skipExistingOnOa(state, unique, oaTitles, { keyOf: (d) => `article:${d.key}`, titleOf: (d) => d.title });

  // Tạo theo đúng thứ tự thời gian đăng
  fresh.sort((a, b) => a.postedAt - b.postedAt);
  const withoutCover = fresh.filter((d) => !d.imageUrl && !CONFIG.DANGTIN_DEFAULT_COVER_URL);
  if (withoutCover.length) {
    console.warn(`[DangTin] ${withoutCover.length} bài không có ảnh và chưa đặt DANGTIN_DEFAULT_COVER_URL, bỏ qua: `
      + withoutCover.map((d) => d.nid).join(', '));
  }
  const toCreate = fresh
    .filter((d) => d.imageUrl || CONFIG.DANGTIN_DEFAULT_COVER_URL)
    .slice(0, CONFIG.DANGTIN_MAX_NEW_PER_RUN);

  const planned = [];
  for (const d of toCreate) {
    const item = toArticleItem(d);
    const cover = await prepareCover(d.imageUrl, { publicId: `nid-${d.group}-${d.nid}`, dryRun: !sendEnabled });
    item.coverPhotoUrl = cover.url;
    planned.push({ key: `article:${d.key}`, postedAt: d.postedAt, url: d.url, coverNote: cover.note, item });
  }
  if (!sendEnabled || !planned.length) return { planned, results: [] };

  const titleByKey = new Map(toCreate.map((d) => [`article:${d.key}`, d]));
  const results = await zalo.createArticles(planned.map((p) => ({ ...p.item, _key: p.key })), {
    onCreated: async ({ item, id, coverUsed }) => {
      const d = titleByKey.get(item._key);
      const data = { reason: 'created', title: d.title, sourceUrl: d.url, zaloArticleId: String(id), coverUrl: coverUsed };
      await state.mark(item._key, data);
      await state.mark(`title:${normalizeTitle(d.title)}`, data);
    },
  });
  return { planned, results };
}

async function syncDocuments(state, { sendEnabled, zalo, oaTitles }) {
  const docs = await portal.getDocuments();
  const unseen = docs.filter((d) => !state.has(`document:${d.key}`));

  const now = Date.now();
  const maxAgeMs = CONFIG.DANGTIN_DOCUMENT_MAX_AGE_DAYS * DAY_MS;
  const recent = [];
  for (const d of unseen) {
    if (!d.issuedAt) {
      console.warn(`[DangTin] Bỏ qua văn bản không đọc được ngày ban hành: ${d.codeId} "${d.issuedText}"`);
    } else if (now - d.issuedAt.getTime() > maxAgeMs) {
      await state.mark(`document:${d.key}`, { reason: 'too_old', title: d.codeId, sourceUrl: d.url });
    } else {
      recent.push(d);
    }
  }

  if (recent.length && !CONFIG.DANGTIN_DEFAULT_COVER_URL) {
    console.warn('[DangTin] Chưa đặt DANGTIN_DEFAULT_COVER_URL — văn bản không có ảnh riêng nên bị bỏ qua hết');
    return { planned: [], results: [] };
  }

  const fresh = await skipExistingOnOa(state, recent, oaTitles, {
    keyOf: (d) => `document:${d.key}`,
    titleOf: (d) => toDocumentItem(d).title,
  });
  fresh.sort((a, b) => a.issuedAt - b.issuedAt);
  const toCreate = fresh.slice(0, CONFIG.DANGTIN_MAX_NEW_PER_RUN);
  const planned = toCreate.map((d) => ({ key: `document:${d.key}`, postedAt: d.issuedAt, url: d.url, item: toDocumentItem(d) }));
  if (!sendEnabled || !planned.length) return { planned, results: [] };

  const docByKey = new Map(toCreate.map((d) => [`document:${d.key}`, d]));
  const results = await zalo.createArticles(planned.map((p) => ({ ...p.item, _key: p.key })), {
    onCreated: async ({ item, id, coverUsed }) => {
      const d = docByKey.get(item._key);
      await state.mark(item._key, {
        reason: 'created', title: d.codeId, sourceUrl: d.url, zaloArticleId: String(id), coverUrl: coverUsed,
      });
    },
  });
  return { planned, results };
}

// Tiêu đề bài có sẵn trên OA. Gửi thật mà không đọc được → throw (bỏ cả lượt, thà chậm còn hơn trùng);
// dry-run thì chỉ cảnh báo và trả null (không kiểm tra được).
async function loadOaTitles(zalo, sendEnabled) {
  if (!zalo) {
    if (sendEnabled) throw new Error('Gửi thật cần Zalo article client');
    return null;
  }
  try {
    return await zalo.listRecentTitles();
  } catch (err) {
    if (sendEnabled) throw new Error(`Không kiểm tra được bài có sẵn trên OA, bỏ lượt này: ${err.message}`);
    console.warn(`[DangTin] Không đọc được bài có sẵn trên OA (${err.message}) — dry-run không lọc trùng với OA`);
    return null;
  }
}

// 1 lượt đồng bộ. zalo = client từ createZaloArticleClient: bắt buộc khi sendEnabled; ở dry-run nếu có
// thì dùng để đọc (không ghi) danh sách bài trên OA.
async function runOnce({ sendEnabled = CONFIG.DANGTIN_SEND_ENABLED, zalo } = {}) {
  if (running) {
    console.warn('[DangTin] Lượt trước chưa xong, bỏ qua lượt này');
    return null;
  }

  running = true;
  const summary = { sendEnabled, oaChecked: false, articles: null, documents: null };
  try {
    const oaTitles = await loadOaTitles(zalo, sendEnabled);
    summary.oaChecked = Boolean(oaTitles);
    const state = await loadState({ sendEnabled });
    if (CONFIG.DANGTIN_ARTICLES_ENABLED) {
      try {
        summary.articles = await syncArticles(state, { sendEnabled, zalo, oaTitles });
      } catch (err) {
        console.error('[DangTin] Lỗi đồng bộ tin bài:', err.message);
        summary.articles = { error: err.message };
      }
    }
    if (CONFIG.DANGTIN_DOCUMENTS_ENABLED) {
      try {
        summary.documents = await syncDocuments(state, { sendEnabled, zalo, oaTitles });
      } catch (err) {
        console.error('[DangTin] Lỗi đồng bộ văn bản:', err.message);
        summary.documents = { error: err.message };
      }
    }
    return summary;
  } finally {
    running = false;
  }
}

// Dry-run trong server: chỉ log những bài CHƯA từng log trong process này (tránh log lặp mỗi 10 phút)
function logDryRun(summary) {
  const planned = [...(summary.articles?.planned || []), ...(summary.documents?.planned || [])];
  const fresh = planned.filter((p) => !dryRunSeen.has(`planned:${p.key}`));
  fresh.forEach((p) => {
    dryRunSeen.add(`planned:${p.key}`);
    console.log(`[DangTin][DRY-RUN] Sẽ tạo: ${p.item.title} | cover: ${p.item.coverPhotoUrl}`
      + `${p.coverNote ? ` (${p.coverNote})` : ''} | ${p.url}`);
  });
}

async function runScheduled(zalo) {
  try {
    const summary = await runOnce({ zalo });
    if (summary && !summary.sendEnabled) logDryRun(summary);
  } catch (err) {
    console.error('[DangTin] Lượt đồng bộ lỗi:', err.message);
  }
}

// Gọi từ server.js sau khi kết nối MongoDB
function startDangTin() {
  if (!CONFIG.DANGTIN_ENABLED) {
    console.log('[DangTin] DANGTIN_ENABLED=false — tắt tự động đăng tin');
    return;
  }
  // Require tại đây (không ở đầu file) để script dry-run không kéo theo zaloToken.js —
  // module đó tự refresh token ngay khi được require.
  const { zaloPost, zaloGet } = require('../utils/zaloApi');
  const { createZaloArticleClient } = require('../utils/zaloArticle');
  const zalo = createZaloArticleClient({ post: zaloPost, get: zaloGet }, {
    defaultCoverUrl: CONFIG.DANGTIN_DEFAULT_COVER_URL,
    defaultAuthor: CONFIG.DANGTIN_AUTHOR,
  });

  const intervalMs = CONFIG.DANGTIN_INTERVAL_MINUTES * 60 * 1000;
  // Chờ 2 phút sau khởi động: zaloToken.js đang refresh token lúc boot, gọi Zalo ngay có thể gặp -216
  // và kích hoạt thêm 1 lần refresh chồng lên.
  setTimeout(() => {
    runScheduled(zalo);
    setInterval(() => runScheduled(zalo), intervalMs);
  }, 2 * 60 * 1000);
  console.log(`[DangTin] Tự động đăng tin khởi động (mỗi ${CONFIG.DANGTIN_INTERVAL_MINUTES} phút, `
    + `${CONFIG.DANGTIN_SEND_ENABLED ? 'GỬI THẬT' : 'DRY-RUN'})`);
}

module.exports = { runOnce, startDangTin };
