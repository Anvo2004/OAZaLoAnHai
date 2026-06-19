const axios = require('axios');

async function redisCmd(...args) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await axios.post(url, args, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return res.data.result;
  } catch { return null; }
}

// Lưu profile user vào Redis (key: anhai_profile:{userId}), TTL 90 ngày
// Không ghi đè avatar đã có bằng rỗng — webhook Zalo thường không kèm avatar,
// chỉ Zalo Profile API (getZaloUserProfile) mới trả avatar thật đáng tin cậy.
async function saveProfile(userId, displayName, avatar = '') {
  if (!userId || !displayName || displayName === userId) return;
  const key = `anhai_profile:${userId}`;
  let finalAvatar = avatar || '';
  if (!finalAvatar) {
    const existing = await redisCmd('GET', key);
    if (existing) {
      try { finalAvatar = JSON.parse(existing).avatar || ''; } catch {}
    }
  }
  const value = JSON.stringify({ display_name: displayName, avatar: finalAvatar });
  await redisCmd('SET', key, value, 'EX', 60 * 60 * 24 * 90);
}

// Lấy profile của nhiều userId từ Redis; fallback gọi Zalo API nếu cache miss
// HOẶC nếu cache có nhưng thiếu avatar (webhook ghi vào trước, chưa có avatar thật).
async function getProfiles(userIds) {
  if (!userIds?.length) return {};
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  const result = {};

  // Bước 1: đọc từ Redis bằng MGET
  if (url && token) {
    try {
      const keys = userIds.map(id => `anhai_profile:${id}`);
      const res = await axios.post(url, ['MGET', ...keys], {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const values = res.data.result || [];
      userIds.forEach((id, i) => {
        if (values[i]) {
          try { result[id] = JSON.parse(values[i]); } catch {}
        }
      });
    } catch {}
  }

  // Bước 2: gọi Zalo API cho userId chưa có trong cache HOẶC cache có nhưng thiếu avatar
  const needFetch = userIds.filter(id => !result[id] || !result[id].avatar);
  if (needFetch.length) {
    // Lazy require tránh circular dependency khi module load
    const { getZaloUserProfile } = require('../utils/zaloApi');
    await Promise.all(needFetch.map(async (id) => {
      try {
        const profile = await getZaloUserProfile(id);
        if (profile?.display_name || profile?.avatar) {
          const displayName = profile.display_name || result[id]?.display_name || id;
          const avatar = profile.avatar || result[id]?.avatar || '';
          await saveProfile(id, displayName, avatar);
          result[id] = { display_name: displayName, avatar };
        }
      } catch {}
    }));
  }

  return result;
}

module.exports = { saveProfile, getProfiles };
