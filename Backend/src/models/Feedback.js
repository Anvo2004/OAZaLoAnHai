const mongoose = require('mongoose');

// Gói đính kèm nội bộ (ảnh/video/file + ghi chú) dùng chung cho tab Phân công & tab Xử lý
const attachmentBundleSchema = new mongoose.Schema({
  note:    { type: String, default: '' },
  images:  [{ url: String, name: String }],
  video:   { url: { type: String, default: '' }, name: { type: String, default: '' } },
  file:    { url: { type: String, default: '' }, name: { type: String, default: '' } },
  sentBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', default: null },
  sentAt:  { type: Date, default: null },
}, { _id: false });

const locationSchema = new mongoose.Schema({
  address: { type: String, default: '' },
  lat:     { type: Number, default: null },
  lng:     { type: Number, default: null },
  // Nguồn tọa độ: 'gps' = dân chia sẻ vị trí thật (Zalo/mini-web), 'manual' = geocode tự động
  // từ địa chỉ gõ tay (chỉ là ước lượng). Dùng để quyết định có đẩy tọa độ lên 1022 hay không.
  source:  { type: String, enum: ['manual', 'gps', ''], default: '' },
}, { _id: false });

const feedbackSchema = new mongoose.Schema({
  userId:         { type: String, required: true, index: true },
  displayName:    { type: String, default: '' },
  contact:        { type: String, required: true },
  content:        { type: String, required: true },
  location:       { type: locationSchema, default: () => ({}) },
  imageUrl:       { type: String, default: '' },
  imageUrls:      [{ type: String }],
  categoryId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  // pending = mới / đang xử lý, draft = dự thảo chờ duyệt, resolved = đã gửi dân
  status:         { type: String, enum: ['pending', 'draft', 'resolved', 'processing', 'done'], default: 'pending' },
  createdAt:      { type: Date, default: Date.now },
  deadline:       { type: Date, default: null },
  lastReminderSentAt: { type: Date, default: null },
  assignedTo:     { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', default: null },
  assignedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', default: null },
  // Đính kèm nội bộ — tab Phân công (từ leader) & tab Xử lý (từ officer), ghi đè mỗi lần gửi lại
  assignAttachments: { type: attachmentBundleSchema, default: () => ({}) },
  draftAttachments:  { type: attachmentBundleSchema, default: () => ({}) },
  // Dự thảo
  draftResponse:  { type: String, default: '' },
  draftBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', default: null },
  draftAt:        { type: Date, default: null },
  // Duyệt / Từ chối
  approvedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', default: null },
  rejectedReason: { type: String, default: '' },
  // Phản hồi cuối gửi dân
  finalResponse:  { type: String, default: '' },
  sentAt:         { type: Date, default: null },
  // Đồng bộ sang Cổng góp ý 1022 (CGY) — xem src/services/cgy1022Service.js
  cgy1022: {
    synced:    { type: Boolean, default: false },
    gopyId:    { type: String,  default: '' },
    syncedAt:  { type: Date,    default: null },
    attempts:  { type: Number,  default: 0 },
    lastError: { type: String,  default: '' },
    // Theo dõi ngược trạng thái xử lý từ 1022 — xem src/services/cgy1022StatusService.js
    resultNotifiedAt: { type: Date,   default: null },
    resultStatus:     { type: String, default: '' },
  },
  // Legacy fields giữ tương thích
  response:       { type: String, default: '' },
  respondedAt:    { type: Date, default: null },
  respondedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', default: null },
  note:           { type: String, default: '' },
  updatedAt:      { type: Date, default: null },
});

module.exports = mongoose.model('Feedback', feedbackSchema);
