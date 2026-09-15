const axios = require('axios');
const CONFIG = require('../config');
const { encodeImageUrl } = require('./zaloArticle');
const { uploadResizedFromUrl, isCloudinaryConfigured } = require('./cloudinary');

// ============================================================
// Chọn URL ảnh cover gửi Zalo cho 1 bài:
//   1. Encode URL (tên file có dấu cách / tiếng Việt → "photo_url ... is invalid").
//   2. Ảnh lớn hơn DANGTIN_MAX_COVER_BYTES → thu nhỏ qua Cloudinary (Zalo không tải được ảnh ~1MB+,
//      lỗi -200 "Upload media failed" chỉ hiện ở bước verify sau ~24s).
//   3. Không có ảnh / không thu nhỏ được → cover mặc định.
// Nếu Zalo vẫn từ chối, zaloArticle.createOne() còn 1 lớp fallback về cover mặc định.
// ============================================================

async function getImageBytes(url) {
  const res = await axios.head(url, {
    timeout: 15000,
    maxRedirects: 3,
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  const len = parseInt(res.headers['content-length'], 10);
  return Number.isFinite(len) ? len : null;
}

// dryRun: chỉ báo sẽ làm gì, không upload Cloudinary. Trả về { url, note }
async function prepareCover(imageUrl, { publicId, dryRun = false } = {}) {
  const fallback = CONFIG.DANGTIN_DEFAULT_COVER_URL;
  if (!imageUrl) return { url: fallback, note: 'bài không có ảnh → cover mặc định' };

  const encoded = encodeImageUrl(imageUrl);
  let bytes = null;
  try {
    bytes = await getImageBytes(encoded);
  } catch (err) {
    // Không đo được thì cứ thử ảnh gốc — lỗi thì Zalo fallback về cover mặc định
    return { url: encoded, note: `không đo được dung lượng (${err.message}), dùng ảnh gốc` };
  }
  const kb = bytes == null ? '?' : Math.round(bytes / 1024);
  if (bytes == null || bytes <= CONFIG.DANGTIN_MAX_COVER_BYTES) {
    return { url: encoded, note: `ảnh gốc ${kb}KB` };
  }

  if (!isCloudinaryConfigured()) {
    return { url: fallback, note: `ảnh ${kb}KB quá lớn, chưa cấu hình Cloudinary → cover mặc định` };
  }
  if (dryRun) return { url: encoded, note: `ảnh ${kb}KB quá lớn → sẽ thu nhỏ qua Cloudinary khi gửi thật` };

  try {
    const resized = await uploadResizedFromUrl(encoded, publicId);
    return { url: resized, note: `ảnh ${kb}KB → đã thu nhỏ qua Cloudinary` };
  } catch (err) {
    return { url: fallback, note: `thu nhỏ qua Cloudinary lỗi (${err.message}) → cover mặc định` };
  }
}

module.exports = { prepareCover };
