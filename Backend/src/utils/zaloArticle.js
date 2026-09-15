const { truncate } = require('./text');

// ============================================================
// Bài viết Zalo OA ("Nội dung dạng Bài viết") — port từ THUONGDUC/frontend/DangTin/src/zalo/articleClient.js.
//   - Tạo:    POST /v2.0/article/create  → trả "token" (chưa phải id)
//   - Verify: POST /v2.0/article/verify  → id thật khi Zalo xử lý xong (bất đồng bộ)
//   - Xoá:    POST /v2.0/article/remove  (dùng cho script thử cover)
// KHÔNG broadcast tới người quan tâm.
//
// Không tự đọc/refresh token: caller truyền vào { post(url, body), get(url, params) } → axios response.
//   - Trong server: zaloApi.zaloPost/zaloGet — dùng CHUNG token + cơ chế refresh của zaloToken.js
//     (refresh token Zalo dùng 1 lần, 2 nơi cùng refresh sẽ làm hỏng token của nhau).
//   - Script chạy riêng: chỉ ĐỌC access token từ Redis, không bao giờ refresh.
// ============================================================

const CREATE_URL = 'https://openapi.zalo.me/v2.0/article/create';
const VERIFY_URL = 'https://openapi.zalo.me/v2.0/article/verify';
const REMOVE_URL = 'https://openapi.zalo.me/v2.0/article/remove';

// Lỗi Zalo liên quan ảnh cover — gặp thì thử lại bằng ảnh cover mặc định. "Upload media failed"
// (-200) chỉ hiện ở bước VERIFY khi Zalo không tải được ảnh (VD ảnh ~1MB+), không phải lúc create.
const COVER_ERROR_RE = /photo_url|cover|ảnh đại diện|anh dai dien|upload media failed/i;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Ảnh trên trang phường có dấu cách / tiếng Việt trong tên file → Zalo báo "photo_url ... is invalid".
// URL() percent-encode khoảng trắng + ký tự non-ASCII và giữ nguyên các %XX đã mã hoá sẵn.
function encodeImageUrl(url) {
  if (!url) return '';
  try {
    return new URL(url.trim()).href;
  } catch {
    return encodeURI(url.trim());
  }
}

function createZaloArticleClient({ post, get }, { defaultCoverUrl = '', defaultAuthor = '' } = {}) {
  // Tiêu đề các bài mới nhất trên OA (mọi nguồn) — để không tạo trùng bài người/hệ thống khác đã đăng.
  // Tại 15/09/2026 OA An Hải ĐÃ có 1 hệ thống khác tự đăng tin tức từ trang phường (lô 10:15 và 16:15).
  async function listRecentTitles({ pages = 3 } = {}) {
    const titles = [];
    for (let page = 0; page < pages; page++) {
      // getslice giới hạn tối đa 10 bài/lần (limit > 10 → -201 "maximum limit is 10")
      const { data } = await get('https://openapi.zalo.me/v2.0/article/getslice', { offset: page * 10, limit: 10, type: 'normal' });
      if (data?.error !== 0) throw new Error(`Không đọc được danh sách bài trên OA: ${JSON.stringify(data)}`);
      const medias = data.data?.medias || [];
      medias.forEach((m) => titles.push(m.title || ''));
      if (medias.length < 10) break;
    }
    return titles;
  }

  async function createArticle({ title, author, description, coverPhotoUrl, bodyText }, { status = 'show' } = {}) {
    if (!coverPhotoUrl) throw new Error('Bài viết cần ảnh cover (coverPhotoUrl)');

    // Zalo công bố giới hạn title 150 / description 300 nhưng TỪ CHỐI chuỗi dài đúng 150/300
    // (log thật Thượng Đức: "title allow 1 to 150 characters") → lùi về 140/250.
    const payload = {
      type: 'normal',
      title: truncate(title, 140),
      author: truncate(author || defaultAuthor, 50),
      cover: { cover_type: 'photo', photo_url: encodeImageUrl(coverPhotoUrl), status: 'show' },
      description: truncate(description || title, 250),
      body: [{ type: 'text', content: bodyText || description || title }],
      status,
      comment: 'show',
    };

    const { data } = await post(CREATE_URL, payload);
    if (data?.error !== 0 || !data?.data?.token) {
      throw new Error(`Tạo bài viết Zalo thất bại: ${JSON.stringify(data)}`);
    }
    return data.data.token;
  }

  async function verifyArticle(token, { retries = 8, delayMs = 3000 } = {}) {
    let last = null;
    for (let attempt = 1; attempt <= retries; attempt++) {
      const { data } = await post(VERIFY_URL, { token });
      if (data?.error === 0 && data?.data?.id) return data.data.id;
      last = data;
      if (attempt < retries) await sleep(delayMs);
    }
    throw new Error(`Không lấy được id bài viết sau ${retries} lần verify: ${JSON.stringify(last)}`);
  }

  async function removeArticle(id) {
    const { data } = await post(REMOVE_URL, { id });
    if (data?.error !== 0) throw new Error(`Xoá bài viết Zalo thất bại: ${JSON.stringify(data)}`);
    return data;
  }

  async function createAndVerify(item, opts) {
    const token = await createArticle(item, opts);
    // Bài có ảnh + nội dung dài cần lâu hơn ("Media is being processed") → 8 lần × 3s
    return verifyArticle(token);
  }

  // Tạo 1 bài; nếu Zalo từ chối ảnh của bài thì thử lại 1 lần với ảnh cover mặc định.
  // Tạo thất bại = Zalo chưa tạo bài nào nên thử lại không gây trùng.
  async function createOne(item, opts) {
    try {
      return { id: await createAndVerify(item, opts), coverUsed: item.coverPhotoUrl };
    } catch (err) {
      const canFallback = defaultCoverUrl && item.coverPhotoUrl !== defaultCoverUrl && COVER_ERROR_RE.test(err.message);
      if (!canFallback) throw err;
      console.warn(`[DangTin] Zalo từ chối ảnh bài "${item.title}" (${err.message}) → thử lại với ảnh cover mặc định`);
      const retryItem = { ...item, coverPhotoUrl: defaultCoverUrl };
      return { id: await createAndVerify(retryItem, opts), coverUsed: defaultCoverUrl };
    }
  }

  // Mỗi bài try/catch RIÊNG và báo kết quả qua onCreated ngay khi xong 1 bài — caller đánh dấu
  // "đã gửi" + lưu ngay theo TỪNG bài. Trước đây Thượng Đức throw giữa lô khiến bài đã tạo
  // thành công không kịp lưu → lần sau tạo trùng.
  async function createArticles(items, { onCreated } = {}) {
    const results = [];
    for (const item of items) {
      try {
        const { id, coverUsed } = await createOne(item);
        console.log(`[DangTin] Đã tạo bài viết Zalo id=${id}: ${item.title}`);
        const result = { item, id, coverUsed };
        results.push(result);
        if (onCreated) await onCreated(result);
      } catch (err) {
        console.error(`[DangTin] Lỗi tạo bài "${item.title}", sẽ thử lại lượt sau: ${err.message}`);
        results.push({ item, error: err.message });
      }
    }
    return results;
  }

  return { listRecentTitles, createArticle, verifyArticle, removeArticle, createOne, createArticles };
}

module.exports = { createZaloArticleClient, encodeImageUrl };
