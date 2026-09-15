const axios = require('axios');
const CONFIG = require('../config');
const { decodeEntities, stripHtml, htmlToParagraphs } = require('./text');

// ============================================================
// Đọc tin bài / văn bản từ trang thông tin điện tử anhai.danang.gov.vn.
// Trang chạy DotNetNuke (module CMS14_TinTuc + QTI_VanBan_2020), KHÔNG phải vnPortal VNPT:
// /api/public/articles, /api/public/documents đều trả trang 404 của IIS (đã thử 15/09/2026).
// Vì vậy quét HTML — tương đương workaround "quét trang chủ" của Thượng Đức.
// ============================================================

const http = axios.create({
  timeout: 20000,
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' },
  responseType: 'text',
});

// Đường dẫn có ký tự tiếng Việt (VD /thong-tin-chi-đao-đieu-hanh) phải qua URL để được percent-encode
function absoluteUrl(pathOrUrl) {
  return new URL(pathOrUrl, `${CONFIG.DANGTIN_PORTAL_URL}/`).href;
}

async function getHtml(pathOrUrl) {
  const { data } = await http.get(absoluteUrl(pathOrUrl));
  return data;
}

// Link bài: /chi-tiet-tin/group/{group}/nid/{nid}/{slug}. Widget "Tin mới" để href KHÔNG có dấu nháy
// (href=http://...>Tiêu đề</a>) nên slug dừng ở khoảng trắng, nháy hoặc '>'.
const ARTICLE_LINK_RE = /\/chi-tiet-tin\/group\/(\d+)\/nid\/(\d+)\/([^'"\s>]*)/g;

function extractArticleLinks(html) {
  const found = new Map();
  for (const m of html.matchAll(ARTICLE_LINK_RE)) {
    const [path, group, nid] = m;
    const key = `${group}:${nid}`;
    if (!found.has(key)) found.set(key, { key, group, nid, url: absoluteUrl(path) });
  }
  return found;
}

// Gộp link từ các trang danh sách, giữ thứ tự xuất hiện (trang chủ trước)
async function getRecentArticleLinks() {
  const pages = CONFIG.DANGTIN_LIST_PAGES.split(',').map((s) => s.trim()).filter(Boolean);
  const merged = new Map();
  for (const page of pages) {
    try {
      extractArticleLinks(await getHtml(page)).forEach((link, key) => {
        if (!merged.has(key)) merged.set(key, link);
      });
    } catch (err) {
      console.warn(`[DangTin] Không quét được trang danh sách ${page}: ${err.message}`);
    }
  }
  return [...merged.values()];
}

// Nội dung <span id="dnn_ctrXXX_Main_lbl_ct_{suffix}">…</span> (không lồng span bên trong)
function pickLabel(html, suffix) {
  const m = html.match(new RegExp(`id="[^"]*_lbl_ct_${suffix}"[^>]*>([\\s\\S]*?)</span>`));
  return m ? m[1] : '';
}

function pickMeta(html, property) {
  const m = html.match(new RegExp(`<meta[^>]*property=['"]${property}['"][^>]*content=['"]([^'"]*)['"]`, 'i'));
  return m ? decodeEntities(m[1]).trim() : '';
}

// "10:16 | 15/09/2026" (giờ Việt Nam) → Date
function parsePostedAt(text) {
  const m = (text || '').match(/(\d{1,2}):(\d{2})\s*\|\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!m) return null;
  const [, hh, mi, dd, mm, yyyy] = m;
  const pad = (v) => String(v).padStart(2, '0');
  const date = new Date(`${yyyy}-${pad(mm)}-${pad(dd)}T${pad(hh)}:${mi}:00+07:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Thân bài nằm trong span lbl_ct_noidung có thể chứa span con → cắt tới khối "Tác giả" thay vì </span> đầu tiên
function extractContentHtml(html) {
  const start = html.search(/id="[^"]*_lbl_ct_noidung"[^>]*>/);
  if (start === -1) return '';
  const bodyStart = html.indexOf('>', start) + 1;
  let end = html.indexOf('class="qti_ct_tacgia"', bodyStart);
  if (end === -1) end = html.indexOf('id="fb-root"', bodyStart);
  if (end === -1) end = bodyStart + 100000;
  return html.slice(bodyStart, end);
}

async function getArticleDetail(link) {
  const html = await getHtml(link.url);
  const contentHtml = extractContentHtml(html);
  const firstImg = (contentHtml.match(/<img[^>]*src=['"]([^'"]+)['"]/i) || [])[1];
  const image = pickMeta(html, 'og:image') || (firstImg ? absoluteUrl(decodeEntities(firstImg)) : '');

  return {
    key: link.key,
    nid: link.nid,
    group: link.group,
    url: link.url,
    title: stripHtml(pickLabel(html, 'tieude')) || pickMeta(html, 'og:title'),
    summary: stripHtml(pickLabel(html, 'gioithieu')),
    contentText: htmlToParagraphs(contentHtml),
    author: stripHtml(pickLabel(html, 'tacgia')),
    postedAt: parsePostedAt(stripHtml(pickLabel(html, 'ngaydang'))),
    imageUrl: image,
  };
}

// ── Văn bản (module QTI_VanBan_2020, lưới Telerik RadGrid) ─────────────────
// Cột: STT | Số ký hiệu | Ngày ban hành | Trích yếu. Tại 15/09/2026 kho văn bản của An Hải
// đang trống ("Chưa có dữ liệu", kể cả khi bấm "Xem tất cả") — văn bản thực tế được đăng dưới
// dạng tin ở chuyên mục Thông báo / Phổ biến pháp luật và đã được đồng bộ theo luồng tin bài.
// Phần này chưa kiểm chứng được với dữ liệu thật, để sẵn khi phường bắt đầu dùng module văn bản.
function parseDdMmYyyy(text) {
  const m = (text || '').match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!m) return null;
  const date = new Date(`${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}T00:00:00+07:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseDocumentRows(html, pageUrl) {
  const docs = [];
  for (const row of html.matchAll(/<tr[^>]*class="rg(?:Row|AltRow)[^"]*"[^>]*>([\s\S]*?)<\/tr>/g)) {
    const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => c[1]);
    if (cells.length < 4) continue;
    const codeId = stripHtml(cells[1]);
    const issuedText = stripHtml(cells[2]);
    const epitomize = stripHtml(cells[3]);
    if (!codeId && !epitomize) continue;
    const href = (row[1].match(/href=['"]((?!javascript:)[^'"#][^'"]*)['"]/i) || [])[1];
    docs.push({
      key: `${codeId}__${issuedText}`,
      codeId,
      issuedAt: parseDdMmYyyy(issuedText),
      issuedText,
      epitomize,
      url: href ? absoluteUrl(decodeEntities(href)) : pageUrl,
    });
  }
  return docs;
}

async function getDocuments() {
  const pages = CONFIG.DANGTIN_DOCUMENT_PAGES.split(',').map((s) => s.trim()).filter(Boolean);
  const merged = new Map();
  for (const page of pages) {
    try {
      const html = await getHtml(page);
      parseDocumentRows(html, absoluteUrl(page)).forEach((d) => {
        if (!merged.has(d.key)) merged.set(d.key, d);
      });
    } catch (err) {
      console.warn(`[DangTin] Không quét được trang văn bản ${page}: ${err.message}`);
    }
  }
  return [...merged.values()];
}

module.exports = { getRecentArticleLinks, getArticleDetail, getDocuments, parsePostedAt, parseDocumentRows };
