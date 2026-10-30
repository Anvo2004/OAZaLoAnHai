const mongoose = require('mongoose');

// Người dân đã đăng nhập ReportApp bằng Zalo.
// zaloId là ID OAuth (graph.zalo.me/v2.0/me) — cùng ID ghi vào Feedback.userId khi gửi qua ReportApp.
// Lần đầu gửi phản ánh, người dân được hỏi cho phép sử dụng SĐT; đồng ý thì lưu lại ở đây để
// các lần sau KHÔNG hỏi lại và form tự điền sẵn SĐT.
const citizenSchema = new mongoose.Schema({
  zaloId:         { type: String, required: true, unique: true, index: true },
  name:           { type: String, default: '' },
  avatar:         { type: String, default: '' },
  phone:          { type: String, default: '' },
  phoneConsent:   { type: Boolean, default: false },
  phoneConsentAt: { type: Date, default: null },
  lastLoginAt:    { type: Date, default: null },
  createdAt:      { type: Date, default: Date.now },
});

module.exports = mongoose.model('Citizen', citizenSchema);
