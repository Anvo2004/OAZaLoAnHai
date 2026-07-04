const axios = require('axios');
const CONFIG = require('../config');

// ============================================================
// Đồng bộ phản ánh sang Cổng góp ý 1022 (CGY - Green Global)
// Tài liệu: Document/Nâng Cấp CGY-Tài liệu mô tả API.md
// - Đăng nhập: POST {BASE_URL}{LOGIN_PATH} {tenDangNhap, matKhau} → {access_token}
// - Đẩy góp ý: POST {BASE_URL}/public/gopy (Bearer token)
// Nguyên tắc: KHÔNG được chặn luồng tiếp nhận phản ánh của người dân —
// mọi lỗi ở đây chỉ log + đánh dấu chưa sync để retry job xử lý sau.
// ============================================================

const TIMEOUT_MS = 10000;

// Cache token trong RAM: { token, expiresAt }
let tokenCache = null;

function isConfigured() {
  return Boolean(CONFIG.CGY1022_BASE_URL && CONFIG.CGY1022_USERNAME && CONFIG.CGY1022_PASSWORD);
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

// Giải mã phần payload của JWT để lấy hạn token (exp); lỗi thì coi như sống 30 phút
function decodeTokenExpiry(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8'));
    if (payload.exp) return payload.exp * 1000;
  } catch (e) { /* token không phải JWT chuẩn */ }
  return Date.now() + 30 * 60 * 1000;
}

async function login() {
  const url = `${CONFIG.CGY1022_BASE_URL}${CONFIG.CGY1022_LOGIN_PATH}`;
  const res = await axios.post(url, {
    tenDangNhap: CONFIG.CGY1022_USERNAME,
    matKhau: CONFIG.CGY1022_PASSWORD,
  }, { timeout: TIMEOUT_MS });

  const token = res.data?.access_token;
  if (!token) throw new Error(`Đăng nhập CGY không trả access_token (HTTP ${res.status})`);

  tokenCache = { token, expiresAt: decodeTokenExpiry(token) };
  console.log('[CGY1022] Đăng nhập thành công, token hạn tới', new Date(tokenCache.expiresAt).toISOString());
  return token;
}

// Lấy token còn hạn (trừ hao 60s); hết hạn thì đăng nhập lại
async function getToken(forceRefresh = false) {
  if (!forceRefresh && tokenCache && tokenCache.expiresAt - 60000 > Date.now()) {
    return tokenCache.token;
  }
  return login();
}

// Map document Feedback (đã populate categoryId) → body POST /public/gopy theo tài liệu
function buildPayload(fb) {
  const categoryName = fb.categoryId?.name || '';
  const created = new Date(fb.createdAt || Date.now());
  const shortCode = fb._id.toString().slice(-5).toUpperCase();

  // Giờ VN cho ngayDienRa (dd/MM/yyyy) + thoiGianDienRa (HH:mm)
  const vn = new Date(created.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const pad = (n) => String(n).padStart(2, '0');
  const ngayDienRa = `${pad(vn.getDate())}/${pad(vn.getMonth() + 1)}/${vn.getFullYear()}`;
  const thoiGianDienRa = `${pad(vn.getHours())}:${pad(vn.getMinutes())}`;

  const content = fb.content || '';
  const tieuDePrefix = categoryName ? `[${categoryName}] ` : '';
  const tieuDe = `${tieuDePrefix}${content.slice(0, 60)}${content.length > 60 ? '…' : ''} #${shortCode}`;

  const imageUrls = (fb.imageUrls && fb.imageUrls.length > 0) ? fb.imageUrls : (fb.imageUrl ? [fb.imageUrl] : []);

  return {
    userId: Number(CONFIG.CGY1022_USER_ID) || 0,
    tenDayDu: fb.displayName || 'Người dân phường An Hải',
    email: CONFIG.CGY1022_DEFAULT_EMAIL,
    soDienThoai: fb.contact || '',
    tieuDe,
    noiDungYKien: content,
    noiDienRa: fb.location?.address || 'Phường An Hải, Đà Nẵng',
    latitude: fb.location?.lat ?? 0,
    longitude: fb.location?.lng ?? 0,
    ngayDienRa,
    thoiGianDienRa,
    videos: '',
    amThanh: '',
    hinhAnhs: imageUrls.map((url, i) => ({ url, ten: `Ảnh phản ánh ${i + 1}` })),
    fileDinhKem: { url: '', ten: '' },
    linhVucId: getLinhVucId(categoryName),
    nguonGopY: CONFIG.CGY1022_NGUON,
  };
}

// Đẩy 1 phản ánh lên 1022. Trả { ok: true, gopyId } hoặc { ok: false, error }
// KHÔNG throw — caller không phải bọc try/catch.
async function pushFeedback(fb) {
  if (!isConfigured()) return { ok: false, error: 'CGY1022 chưa cấu hình (.env)' };

  const payload = buildPayload(fb);
  if (payload.linhVucId == null) {
    return { ok: false, error: `Chưa map linhVucId cho danh mục "${fb.categoryId?.name || '?'}"` };
  }

  const url = `${CONFIG.CGY1022_BASE_URL}/public/gopy`;
  try {
    let token = await getToken();
    let res;
    try {
      res = await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: TIMEOUT_MS,
      });
    } catch (err) {
      // Token hết hạn giữa chừng → re-login đúng 1 lần rồi thử lại
      if (err.response?.status === 401) {
        token = await getToken(true);
        res = await axios.post(url, payload, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: TIMEOUT_MS,
        });
      } else {
        throw err;
      }
    }

    // Tài liệu không mô tả rõ body trả về — nhận diện id linh hoạt, 2xx coi là thành công
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

module.exports = { isConfigured, pushFeedback, buildPayload, getToken, getLinhVucId };
