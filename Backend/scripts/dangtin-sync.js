/**
 * Chạy 1 lượt đồng bộ đăng tin ở chế độ DRY-RUN và in danh sách bài dự định tạo trên Zalo OA.
 *
 *   cd Backend && node scripts/dangtin-sync.js --once
 *
 * Script này KHÔNG BAO GIỜ gửi thật (kể cả khi DANGTIN_SEND_ENABLED=true): gửi thật chỉ chạy
 * trong process server (dangTinService.startDangTin) để
 *   1) dùng chung token Zalo của server — không require zaloToken.js (module đó tự refresh token
 *      khi được require, refresh token Zalo dùng 1 lần → làm hỏng token của server);
 *   2) không có 2 nơi cùng quét + tạo bài song song gây trùng.
 * Có MONGO_URI thì đọc trạng thái "đã gửi" thật từ DB (chỉ đọc); không có thì coi như chưa gửi bài nào.
 * Có Redis thì đọc danh sách bài trên OA (chỉ GET, không refresh token) để lọc bài OA đã có sẵn.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const CONFIG = require('../src/config');
const { runOnce } = require('../src/services/dangTinService');
const { createZaloArticleClient } = require('../src/utils/zaloArticle');
const { hasRedisConfig, readOnlyGet } = require('../src/utils/zaloReadOnlyToken');

function fmtDate(d) {
  return d ? new Date(d).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '?';
}

function printSection(label, section) {
  if (!section) {
    console.log(`\n=== ${label}: (đang tắt)`);
    return;
  }
  if (section.error) {
    console.log(`\n=== ${label}: LỖI — ${section.error}`);
    return;
  }
  console.log(`\n=== ${label}: ${section.planned.length} bài dự định tạo`);
  section.planned.forEach((p, i) => {
    const { item } = p;
    console.log(`\n[${i + 1}] ${item.title}`);
    console.log(`    Đăng lúc  : ${fmtDate(p.postedAt)}`);
    console.log(`    Nguồn     : ${p.url}`);
    console.log(`    Tác giả   : ${item.author || CONFIG.DANGTIN_AUTHOR}`);
    console.log(`    Cover     : ${item.coverPhotoUrl}${p.coverNote ? `  (${p.coverNote})` : ''}`);
    console.log(`    Mô tả     : ${item.description}`);
    console.log(`    Độ dài    : title ${item.title.length}/140, mô tả ${item.description.length}/250, thân bài ${item.bodyText.length} ký tự`);
  });
}

async function main() {
  if (CONFIG.MONGO_URI) {
    // autoIndex/autoCreate off: dry-run chỉ đọc, không tạo collection/index trên DB production
    await mongoose.connect(CONFIG.MONGO_URI, { autoIndex: false, autoCreate: false });
    console.log('[DangTin] Đã kết nối MongoDB — dùng trạng thái "đã gửi" thật (chỉ đọc)');
  } else {
    console.log('[DangTin] Không có MONGO_URI — coi như chưa gửi bài nào');
  }
  console.log(`[DangTin] DRY-RUN — nguồn ${CONFIG.DANGTIN_PORTAL_URL}, bỏ qua bài cũ hơn ${CONFIG.DANGTIN_MAX_AGE_DAYS} ngày, `
    + `group: ${CONFIG.DANGTIN_ARTICLE_GROUPS || 'tất cả'}`);

  // Có Redis (VD chạy trên VPS) thì đọc danh sách bài trên OA để lọc bài đã có sẵn — chỉ GET,
  // client này không thể tạo bài (post luôn báo lỗi).
  let zalo;
  if (hasRedisConfig()) {
    zalo = createZaloArticleClient({
      get: readOnlyGet,
      post: async () => { throw new Error('dangtin-sync.js chỉ chạy dry-run, không tạo bài'); },
    });
  } else {
    console.log('[DangTin] Không có Redis — KHÔNG lọc được bài OA đã có sẵn (danh sách dưới đây có thể trùng)');
  }

  const summary = await runOnce({ sendEnabled: false, zalo });
  if (zalo) console.log(summary.oaChecked ? '[DangTin] Đã lọc bài OA có sẵn' : '[DangTin] Đọc OA lỗi — chưa lọc bài OA có sẵn');
  printSection('TIN BÀI', summary.articles);
  printSection('VĂN BẢN', summary.documents);
}

main()
  .catch((err) => {
    console.error('[DangTin] Lỗi:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
