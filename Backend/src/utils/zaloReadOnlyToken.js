const axios = require('axios');

// ============================================================
// Gọi Zalo API từ SCRIPT chạy riêng (ngoài process server) mà không đụng tới vòng đời token.
// Chỉ ĐỌC access token server đang dùng từ Redis (anhai_zalo_access_token) — KHÔNG refresh và KHÔNG
// require zaloToken.js (module đó tự refresh ngay khi được require; refresh token Zalo dùng 1 lần,
// refresh từ nơi thứ 2 làm hỏng token của server). Gặp -216 thì báo lỗi, chờ server tự refresh.
// ============================================================

let cachedToken = null;

function hasRedisConfig() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function readAccessToken() {
  if (cachedToken) return cachedToken;
  if (!hasRedisConfig()) throw new Error('Thiếu UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN');
  const res = await axios.post(process.env.UPSTASH_REDIS_REST_URL, ['GET', 'anhai_zalo_access_token'], {
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' },
  });
  if (!res.data?.result) throw new Error('Redis chưa có anhai_zalo_access_token');
  cachedToken = res.data.result;
  return cachedToken;
}

function checkExpired(res) {
  if (res.data?.error === -216) {
    throw new Error('Access token hết hạn (-216). Script không tự refresh — chờ server refresh rồi chạy lại.');
  }
  return res;
}

async function readOnlyPost(url, body) {
  const token = await readAccessToken();
  return checkExpired(await axios.post(url, body, {
    headers: { access_token: token, 'Content-Type': 'application/json' },
    timeout: 20000,
  }));
}

async function readOnlyGet(url, params) {
  const token = await readAccessToken();
  return checkExpired(await axios.get(url, { params, headers: { access_token: token }, timeout: 20000 }));
}

module.exports = { hasRedisConfig, readOnlyPost, readOnlyGet };
