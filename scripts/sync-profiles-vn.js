/**
 * sync-profiles-vn.js
 * Chạy trên VPS Việt Nam để lấy tên + avatar follower từ Zalo API
 *
 * Cách dùng:
 *   UPSTASH_REDIS_REST_URL=xxx UPSTASH_REDIS_REST_TOKEN=xxx ZALO_OA_TOKEN=xxx node sync-profiles-vn.js
 *
 * Hoặc tạo file .env rồi chạy: node -r dotenv/config sync-profiles-vn.js
 */

const https = require('https');

const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const ZALO_TOKEN  = process.env.ZALO_OA_TOKEN;

if (!REDIS_URL || !REDIS_TOKEN || !ZALO_TOKEN) {
  console.error('❌ Thiếu env: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, ZALO_OA_TOKEN');
  process.exit(1);
}

// ── Helpers ────────────────────────────────────────────────────────
function httpPost(url, body, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: u.hostname, path: u.pathname + u.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers },
    }, res => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch { resolve(raw); } });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function httpGet(url, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    https.get({ hostname: u.hostname, path: u.pathname + u.search, headers }, res => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch { resolve(raw); } });
    }).on('error', reject);
  });
}

async function redis(...args) {
  const r = await httpPost(REDIS_URL, args, { Authorization: `Bearer ${REDIS_TOKEN}` });
  return r?.result ?? null;
}

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Bắt đầu sync profile từ VPS Việt Nam...\n');

  // 1. Lấy danh sách follower từ Redis
  const raw = await redis('GET', 'anhai_oa_followers');
  if (!raw) {
    console.error('❌ Không có dữ liệu followers trong Redis (key: anhai_oa_followers)');
    console.log('👉 Bấm Đồng bộ trong trang Followers trước rồi chạy lại script này');
    process.exit(1);
  }

  const followers = JSON.parse(raw);
  console.log(`📋 Tổng follower: ${followers.length}`);

  // 2. Fetch profile từng người
  let success = 0, failed = 0, skipped = 0;

  for (let i = 0; i < followers.length; i++) {
    const f = followers[i];
    const userId = f.user_id;

    // Kiểm tra đã có trong cache chưa
    const cached = await redis('GET', `anhai_profile:${userId}`);
    if (cached) {
      const p = JSON.parse(cached);
      if (p.display_name && p.display_name !== userId) {
        skipped++;
        if (skipped <= 3 || skipped % 50 === 0) process.stdout.write(`⏭ `);
        continue;
      }
    }

    try {
      const data = encodeURIComponent(JSON.stringify({ user_id: userId }));
      const result = await httpGet(
        `https://openapi.zalo.me/v2.0/oa/getprofile?data=${data}`,
        { access_token: ZALO_TOKEN }
      );

      if (result?.error === 0 && result?.data?.display_name) {
        const name = result.data.display_name;
        const avatar = result.data.avatar || '';
        const value = JSON.stringify({ display_name: name, avatar });
        await redis('SET', `anhai_profile:${userId}`, value, 'EX', 60 * 60 * 24 * 90);
        success++;
        process.stdout.write(`✅ `);
      } else {
        failed++;
        process.stdout.write(`❌ `);
      }
    } catch (err) {
      failed++;
      process.stdout.write(`⚠ `);
    }

    if ((i + 1) % 20 === 0) {
      console.log(`\n[${i + 1}/${followers.length}] ✅${success} ❌${failed} ⏭${skipped}`);
    }

    await delay(300); // 300ms giữa mỗi request
  }

  console.log('\n\n✅ Hoàn tất!');
  console.log(`   Lấy được tên: ${success}`);
  console.log(`   Không có tên: ${failed}`);
  console.log(`   Đã có sẵn:   ${skipped}`);
  console.log('\n👉 Quay lại web, bấm Đồng bộ lại để cập nhật danh sách hiển thị');
}

main().catch(console.error);
