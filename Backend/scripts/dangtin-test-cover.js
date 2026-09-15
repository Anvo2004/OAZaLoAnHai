/**
 * Thử 1 hoặc nhiều ảnh cover với Zalo OA An Hải: tạo bài viết status "hide" → verify → XOÁ NGAY.
 * Dùng để chốt DANGTIN_DEFAULT_COVER_URL (Zalo từ chối ảnh trên *.dxvtech.vn: "Ảnh đại diện không hợp lệ").
 *
 *   cd Backend && node scripts/dangtin-test-cover.js <url-anh> [url-anh ...]
 *   cd Backend && node scripts/dangtin-test-cover.js --upload <file-anh-local>   # đưa lên Cloudinary rồi thử
 *   cd Backend && node scripts/dangtin-test-cover.js --prepare <url-anh-bai>     # qua pipeline cover thật rồi thử
 *
 * Token: chỉ đọc từ Redis, không refresh — xem src/utils/zaloReadOnlyToken.js.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { createZaloArticleClient, encodeImageUrl } = require('../src/utils/zaloArticle');
const { readOnlyPost, readOnlyGet } = require('../src/utils/zaloReadOnlyToken');

async function uploadToCloudinary(file) {
  const { uploadFromBuffer } = require('../src/utils/cloudinary');
  const publicId = `dangtin-cover-${path.basename(file, path.extname(file))}`;
  return uploadFromBuffer(fs.readFileSync(file), publicId);
}

async function testCover(zalo, coverUrl) {
  console.log(`\n--- Thử cover: ${coverUrl}`);
  if (encodeImageUrl(coverUrl) !== coverUrl) console.log(`    (gửi Zalo dạng đã encode: ${encodeImageUrl(coverUrl)})`);
  let id = null;
  try {
    const token = await zalo.createArticle({
      title: '[TEST] Kiểm tra ảnh cover — bài sẽ bị xoá ngay',
      description: 'Bài kiểm tra tự động của tính năng đăng tin, trạng thái ẩn, xoá ngay sau khi tạo.',
      bodyText: 'Bài kiểm tra ảnh cover. Sẽ bị xoá ngay.',
      coverPhotoUrl: coverUrl,
    }, { status: 'hide' });
    id = await zalo.verifyArticle(token);
    console.log(`    ✅ Zalo CHẤP NHẬN ảnh (bài ẩn id=${id})`);
    return true;
  } catch (err) {
    console.log(`    ❌ Zalo TỪ CHỐI: ${err.message}`);
    return false;
  } finally {
    if (id) {
      try {
        await zalo.removeArticle(id);
        console.log(`    🗑️  Đã xoá bài test id=${id}`);
      } catch (err) {
        console.log(`    ⚠️  KHÔNG xoá được bài test id=${id} — xoá tay trên OA: ${err.message}`);
      }
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.error('Cách dùng: node scripts/dangtin-test-cover.js <url-anh> [...] | --upload <file>');
    process.exit(1);
  }

  const urls = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--upload') {
      const uploaded = await uploadToCloudinary(args[++i]);
      console.log(`Đã upload lên Cloudinary: ${uploaded}`);
      urls.push(uploaded);
    } else if (args[i] === '--prepare') {
      // Chạy đúng pipeline cover của dangTinService (encode → đo dung lượng → thu nhỏ Cloudinary)
      const { prepareCover } = require('../src/utils/coverImage');
      const cover = await prepareCover(args[++i], { publicId: `test-${Date.now()}` });
      console.log(`prepareCover: ${cover.url} (${cover.note})`);
      urls.push(cover.url);
    } else {
      urls.push(args[i]);
    }
  }

  const zalo = createZaloArticleClient({ post: readOnlyPost, get: readOnlyGet });
  const results = [];
  for (const url of urls) results.push([url, await testCover(zalo, url)]);

  console.log('\n=== Kết quả');
  results.forEach(([url, ok]) => console.log(`${ok ? 'OK  ' : 'FAIL'}  ${url}`));
}

main().catch((err) => {
  console.error('Lỗi:', err.message);
  process.exit(1);
});
