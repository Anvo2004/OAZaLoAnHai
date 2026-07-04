// ============================================================
// Probe API Cổng góp ý 1022 (CGY) — chạy tay kiểu Postman.
//
//   node scripts/probe-cgy1022.js              → login + GET danh mục (read-only)
//   node scripts/probe-cgy1022.js --send-test  → gửi 1 góp ý [TEST] lên BASE_URL
//
// ⚠️ CHỈ dùng --send-test khi CGY1022_BASE_URL là môi trường TEST
//    (cgy.greenglobal.com.vn). TUYỆT ĐỐI không gửi test lên web chính 1022.
// Yêu cầu .env: CGY1022_BASE_URL, CGY1022_USERNAME, CGY1022_PASSWORD
// ============================================================
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const axios = require('axios');
const CONFIG = require('../src/config');
const cgy = require('../src/services/cgy1022Service');

const SEND_TEST = process.argv.includes('--send-test');

async function get(pathname, token) {
  const res = await axios.get(`${CONFIG.CGY1022_BASE_URL}${pathname}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    timeout: 10000,
    validateStatus: () => true,
  });
  return res;
}

(async () => {
  if (!cgy.isConfigured()) {
    console.error('❌ Thiếu CGY1022_BASE_URL / CGY1022_USERNAME / CGY1022_PASSWORD trong Backend/.env');
    process.exit(1);
  }
  console.log('BASE_URL:', CONFIG.CGY1022_BASE_URL);

  // 1. Đăng nhập
  let token;
  try {
    token = await cgy.getToken();
    console.log(`✅ Login OK — token dài ${token.length} ký tự (${token.slice(0, 12)}...)`);
  } catch (err) {
    console.error('❌ Login thất bại:', err.response ? `HTTP ${err.response.status} ${JSON.stringify(err.response.data).slice(0, 200)}` : err.message);
    process.exit(1);
  }

  // 2. Danh mục lĩnh vực (để chốt CGY1022_LINHVUC_MAP)
  for (const [label, p] of [
    ['Lĩnh vực (chude)', '/public/gopy/chude'],
    ['Cơ quan (coquan)', '/public/gopy/coquan'],
    ['Đơn vị hành chính', '/public/donvihanhchinh'],
  ]) {
    const res = await get(p, token);
    console.log(`\n=== ${label} — HTTP ${res.status} ===`);
    const items = res.data?.data;
    if (Array.isArray(items)) {
      items.slice(0, 30).forEach((it) => console.log(`  id=${it.id}  ${it.ten}`));
      if (items.length > 30) console.log(`  ... và ${items.length - 30} mục nữa`);
    } else {
      console.log(' ', JSON.stringify(res.data).slice(0, 300));
    }
  }

  // 3. Gửi góp ý TEST (chỉ khi có cờ --send-test)
  if (!SEND_TEST) {
    console.log('\nℹ️  Bỏ qua bước gửi thử. Thêm cờ --send-test để gửi 1 góp ý [TEST] (chỉ trên môi trường test!).');
    return;
  }

  console.log('\n⚠️  Đang gửi góp ý TEST lên', CONFIG.CGY1022_BASE_URL);
  const fakeFeedback = {
    _id: { toString: () => `TEST${Date.now()}` },
    createdAt: new Date(),
    displayName: 'Tài khoản kiểm thử An Hải',
    contact: '0900000000',
    content: '[TEST - vui lòng bỏ qua] Đây là bản ghi kiểm thử tích hợp từ Zalo OA phường An Hải. Xin lỗi vì sự bất tiện.',
    location: { address: 'Phường An Hải, Đà Nẵng (TEST)', lat: 16.06, lng: 108.23 },
    imageUrls: [],
    categoryId: { name: 'Môi trường, Hạ tầng, Xây dựng' },
  };
  const payload = cgy.buildPayload(fakeFeedback);
  payload.tieuDe = `[TEST - vui lòng bỏ qua] ${payload.tieuDe}`;
  console.log('Payload:', JSON.stringify(payload, null, 2));

  const res = await axios.post(`${CONFIG.CGY1022_BASE_URL}/public/gopy`, payload, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 10000,
    validateStatus: () => true,
  });
  console.log(`\n=== POST /public/gopy — HTTP ${res.status} ===`);
  console.log(JSON.stringify(res.data, null, 2).slice(0, 1000));
})().catch((err) => { console.error('❌ Lỗi:', err.message); process.exit(1); });
