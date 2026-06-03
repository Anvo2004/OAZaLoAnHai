const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { getToken, refreshAccessToken } = require('../utils/zaloToken');

const DATA_DIR = path.join(__dirname, '../../data');
const FOLLOWERS_FILE = path.join(DATA_DIR, 'followers.json');

// In-memory cache
let _cache = null;
let _syncedAt = null;

// ─── Redis helpers (tuỳ chọn) ───
async function redisCmd(...args) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await axios.post(url, args, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return res.data.result;
  } catch (err) {
    console.error('[Redis]', err.message);
    return null;
  }
}

// ─── File fallback ───
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function saveToFile(followers) {
  try {
    ensureDataDir();
    fs.writeFileSync(FOLLOWERS_FILE, JSON.stringify({ followers, syncedAt: new Date().toISOString() }));
  } catch (e) {
    console.warn('[Follower] Không lưu được file:', e.message);
  }
}

function loadFromFile() {
  try {
    if (!fs.existsSync(FOLLOWERS_FILE)) return null;
    return JSON.parse(fs.readFileSync(FOLLOWERS_FILE, 'utf-8'));
  } catch {
    return null;
  }
}

// ─── Zalo API helpers ───
async function zaloGet(url) {
  const doReq = (token) => axios.get(url, { headers: { access_token: token } });
  let res = await doReq(getToken());
  if (res.data?.error === -216) {
    try {
      const newToken = await refreshAccessToken();
      res = await doReq(newToken);
    } catch (refreshErr) {
      throw new Error('TOKEN_EXPIRED');
    }
  }
  return res.data;
}

async function fetchAllFollowerIds() {
  const ids = [];
  let offset = 0;
  const count = 50;

  while (true) {
    const data = encodeURIComponent(JSON.stringify({ offset, count }));
    const result = await zaloGet(
      `https://openapi.zalo.me/v2.0/oa/getfollowers?data=${data}`
    );

    if (result?.error !== 0) {
      console.error('[Follower] Lỗi lấy follower:', result?.message);
      break;
    }

    const followers = result?.data?.followers || [];
    for (const f of followers) ids.push(f.user_id);

    if (followers.length < count) break;
    offset += count;
    await new Promise((r) => setTimeout(r, 300));
  }

  return ids;
}

async function getFollowerProfile(userId) {
  const data = encodeURIComponent(JSON.stringify({ user_id: userId }));
  const result = await zaloGet(
    `https://openapi.zalo.me/v2.0/oa/getprofile?data=${data}`
  );
  if (result?.error !== 0) return { user_id: userId, display_name: userId, avatar: '' };
  return {
    user_id: userId,
    display_name: result?.data?.display_name || userId,
    avatar: result?.data?.avatar || '',
  };
}

// ─── Public API ───
async function syncFollowers() {
  console.log('[Follower] Đang đồng bộ danh sách follower...');
  const ids = await fetchAllFollowerIds();

  const profiles = [];
  const limit = Math.min(ids.length, 200);
  for (let i = 0; i < limit; i++) {
    const profile = await getFollowerProfile(ids[i]);
    profiles.push(profile);
    await new Promise((r) => setTimeout(r, 200));
  }

  for (let i = limit; i < ids.length; i++) {
    profiles.push({ user_id: ids[i], display_name: ids[i], avatar: '' });
  }

  _cache = profiles;
  _syncedAt = new Date().toISOString();

  // Lưu vào Redis nếu có, fallback file
  const redisSaved = await redisCmd('SET', 'anhai_oa_followers', JSON.stringify(profiles));
  if (redisSaved !== null) {
    await redisCmd('SET', 'anhai_oa_followers_synced_at', _syncedAt);
  } else {
    saveToFile(profiles);
  }

  console.log(`[Follower] Đã đồng bộ ${profiles.length} follower`);
  return profiles;
}

async function getStoredFollowers() {
  if (_cache) return _cache;

  // Thử Redis
  const raw = await redisCmd('GET', 'anhai_oa_followers');
  if (raw) {
    try {
      _cache = JSON.parse(raw);
      return _cache;
    } catch { /* fall through */ }
  }

  // Thử file
  const fromFile = loadFromFile();
  if (fromFile?.followers) {
    _cache = fromFile.followers;
    _syncedAt = fromFile.syncedAt;
    return _cache;
  }

  return [];
}

async function getSyncedAt() {
  if (_syncedAt) return _syncedAt;
  const fromRedis = await redisCmd('GET', 'anhai_oa_followers_synced_at');
  if (fromRedis) return fromRedis;
  const fromFile = loadFromFile();
  return fromFile?.syncedAt || null;
}

module.exports = { syncFollowers, getStoredFollowers, getSyncedAt };
