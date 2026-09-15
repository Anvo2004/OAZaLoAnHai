const mongoose = require('mongoose');

// Dấu "đã xử lý" của tính năng đăng tin (xem services/dangTinService.js). Mỗi bản ghi = 1 khoá:
//   article:{group}:{nid}  — tin bài trên trang phường
//   title:{tiêu đề chuẩn hoá} — chống trùng khi 1 bài gắn nhiều chuyên mục (khác nid, cùng tiêu đề)
//   document:{số ký hiệu}__{ngày ban hành}
// Ghi ngay sau TỪNG bài tạo thành công (unique key → không bao giờ tạo trùng khi lượt sau quét lại).
const dangTinItemSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  // created: đã tạo trên OA | too_old: quá hạn tuổi | duplicate_title: trùng tiêu đề bài đã tạo
  // exists_on_oa: OA đã có bài cùng tiêu đề (do người/hệ thống khác đăng)
  reason: { type: String, enum: ['created', 'too_old', 'duplicate_title', 'exists_on_oa'], required: true },
  title: { type: String, default: '' },
  sourceUrl: { type: String, default: '' },
  zaloArticleId: { type: String, default: '' },
  coverUrl: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('DangTinItem', dangTinItemSchema);
