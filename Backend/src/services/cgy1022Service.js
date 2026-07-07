const axios = require('axios');
const CONFIG = require('../config');

// ============================================================
// Đồng bộ phản ánh sang Cổng góp ý 1022 (gopy.danang.gov.vn)
// Cơ chế THẬT (đã probe production, khác tài liệu 2022):
// - Xác thực: HTTP Basic Auth (username/password) trên mỗi request — KHÔNG có JWT.
// - Đẩy góp ý: POST {BASE_URL}{GOPY_PATH}  (mặc định /api/gopy)
// - BẮT BUỘC User-Agent trình duyệt, nếu không WAF trả 403.
// - KHÔNG ép Accept: application/json (server trả 406) — để Accept: */*.
// Nguyên tắc: KHÔNG được chặn luồng tiếp nhận phản ánh của người dân —
// mọi lỗi ở đây chỉ log + đánh dấu chưa sync để retry job xử lý sau.
// ============================================================

const TIMEOUT_MS = 10000;
// UA trình duyệt để vượt WAF của gopy.danang.gov.vn
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

function authHeaders() {
  return {
    'User-Agent': USER_AGENT,
    Accept: '*/*',
  };
}

function basicAuth() {
  return { username: CONFIG.CGY1022_USERNAME, password: CONFIG.CGY1022_PASSWORD };
}

function isConfigured() {
  return Boolean(CONFIG.CGY1022_BASE_URL && CONFIG.CGY1022_USERNAME && CONFIG.CGY1022_PASSWORD);
}

// Chỉ hiện SĐT công dân trên 1022 với các loại phản ánh cần liên hệ trực tiếp
// (hạ tầng/môi trường cần xác minh hiện trường, an ninh trật tự cần phản hồi khẩn).
// Các loại còn lại (văn hoá-giáo dục-y tế, dịch vụ công) ẩn SĐT để bảo vệ riêng tư.
// So theo linhVucId (đã map ổn định qua CGY1022_LINHVUC_MAP) thay vì tên category —
// tên category trên từng deployment có thể khác chuỗi hardcode (đã có tiền tố tuỳ biến
// như "An Hải_..." trên production), trong khi linhVucId 1022 (1=Hạ tầng đô thị,
// 21=An ninh trật tự) là cố định phía 1022.
function getShowPhoneLinhVucSet() {
  return new Set(
    String(CONFIG.CGY1022_SHOW_PHONE_LINHVUC || '')
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n))
  );
}

// Đọc map lĩnh vực từ env (JSON: tên danh mục An Hải → linhVucId 1022)
function getLinhVucId(categoryName) {
  try {
    const map = JSON.parse(CONFIG.CGY1022_LINHVUC_MAP);
    if (categoryName && map[categoryName] != null) return Number(map[categoryName]);
  } catch (e) {
    console.error('[CGY1022] CGY1022_LINHVUC_MAP không phải JSON hợp lệ:', e.message);
  }
  return CONFIG.CGY1022_LINHVUC_DEFAULT !== '' ? Number(CONFIG.CGY1022_LINHVUC_DEFAULT) : null;
}

// Map document Feedback (đã populate categoryId) → body POST /api/gopy
function buildPayload(fb) {
  const categoryName = fb.categoryId?.name || '';
  const created = new Date(fb.createdAt || Date.now());
  const shortCode = fb._id.toString().slice(-5).toUpperCase();

  // Giờ VN cho ngayDienRa (dd/MM/yyyy) + thoiGianDienRa (HH:mm)
  const vn = new Date(created.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const pad = (n) => String(n).padStart(2, '0');
  const ngayDienRa = `${pad(vn.getDate())}/${pad(vn.getMonth() + 1)}/${vn.getFullYear()}`;
  const thoiGianDienRa = `${pad(vn.getHours())}:${pad(vn.getMinutes())}`;

  // Tiêu đề = tóm tắt nội dung + mã tra cứu. KHÔNG chèn tên loại (lĩnh vực đã có
  // cột riêng trên 1022, và tên loại có tiền tố "An Hải_" gây rối tiêu đề).
  const content = fb.content || '';
  const tieuDe = `${content.slice(0, 100)}${content.length > 100 ? '…' : ''} #${shortCode}`;

  const imageUrls = (fb.imageUrls && fb.imageUrls.length > 0) ? fb.imageUrls : (fb.imageUrl ? [fb.imageUrl] : []);

  const linhVucId = getLinhVucId(categoryName);
  const showPhone = linhVucId != null && getShowPhoneLinhVucSet().has(linhVucId);

  const payload = {
    userId: Number(CONFIG.CGY1022_USER_ID) || 0,
    tenDayDu: fb.displayName || 'Người dân phường An Hải',
    email: CONFIG.CGY1022_DEFAULT_EMAIL,
    soDienThoai: showPhone ? (fb.contact || '') : '',
    tieuDe,
    noiDungYKien: content,
    noiDienRa: fb.location?.address || 'Phường An Hải, Đà Nẵng',
    ngayDienRa,
    thoiGianDienRa,
    videos: '',
    amThanh: '',
    hinhAnhs: imageUrls.map((url, i) => ({ url, ten: `Ảnh phản ánh ${i + 1}` })),
    fileDinhKem: { url: '', ten: '' },
    linhVucId,
    nguonGopY: CONFIG.CGY1022_NGUON,
  };

  // Chỉ gửi tọa độ khi là vị trí GPS dân xác nhận thật (source: 'gps') — tọa độ suy ra
  // từ geocode tự động lúc dân gõ địa chỉ tay (source: 'manual') chỉ là ước lượng, không
  // gửi lên để tránh 1022 ghim sai vị trí. Không gửi 0,0 giả khi dân bỏ qua vị trí.
  if (fb.location?.source === 'gps' && Number.isFinite(fb.location?.lat) && Number.isFinite(fb.location?.lng)) {
    payload.latitude = fb.location.lat;
    payload.longitude = fb.location.lng;
  }

  return payload;
}

// Đẩy 1 phản ánh lên 1022. Trả { ok: true, gopyId } hoặc { ok: false, error }
// KHÔNG throw — caller không phải bọc try/catch.
async function pushFeedback(fb) {
  if (!isConfigured()) return { ok: false, error: 'CGY1022 chưa cấu hình (.env)' };

  const payload = buildPayload(fb);
  if (payload.linhVucId == null) {
    return { ok: false, error: `Chưa map linhVucId cho danh mục "${fb.categoryId?.name || '?'}"` };
  }

  const url = `${CONFIG.CGY1022_BASE_URL}${CONFIG.CGY1022_GOPY_PATH}`;
  try {
    const res = await axios.post(url, payload, {
      auth: basicAuth(),
      headers: authHeaders(),
      timeout: TIMEOUT_MS,
    });

    // Nhận diện id linh hoạt, 2xx coi là thành công
    const gopyId = String(res.data?.id ?? res.data?.data?.id ?? res.data?.yKienId ?? '');
    console.log(`[CGY1022] Đẩy phản ánh ${payload.tieuDe.slice(-6)} thành công${gopyId ? ` (gopyId=${gopyId})` : ''}`);
    return { ok: true, gopyId };
  } catch (err) {
    const detail = err.response
      ? `HTTP ${err.response.status}: ${JSON.stringify(err.response.data).slice(0, 200)}`
      : err.message;
    console.error('[CGY1022] Đẩy phản ánh thất bại:', detail);
    return { ok: false, error: detail };
  }
}

// GET danh sách phản ánh (read-only) — dùng để probe/verify kết nối mà không ghi gì.
async function listFeedbacks({ page = 1, size = 5, keyword = '' } = {}) {
  const url = `${CONFIG.CGY1022_BASE_URL}${CONFIG.CGY1022_GOPY_PATH}`;
  const res = await axios.get(url, {
    auth: basicAuth(),
    headers: authHeaders(),
    params: { page, size, keyword },
    timeout: TIMEOUT_MS,
  });
  return res.data;
}

// GET chi tiết 1 phản ánh theo gopyId (read-only) — dùng để theo dõi tình trạng xử lý.
// Trả nguyên response thô, KHÔNG giả định cấu trúc field (tài liệu 2022 đã lệch so với
// production — xem cgy1022StatusService.js để biết cách diễn giải).
async function getFeedbackDetail(gopyId) {
  const url = `${CONFIG.CGY1022_BASE_URL}${CONFIG.CGY1022_GOPY_PATH}/${gopyId}`;
  const res = await axios.get(url, {
    auth: basicAuth(),
    headers: authHeaders(),
    timeout: TIMEOUT_MS,
  });
  return res.data;
}

module.exports = { isConfigured, pushFeedback, buildPayload, getLinhVucId, listFeedbacks, getFeedbackDetail };
