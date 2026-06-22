const mongoose = require('mongoose');

const scheduledMessageSchema = new mongoose.Schema({
  userIds:           [{ type: String, required: true }],
  message:           { type: String, default: '' },
  attachmentIds:     [{ type: String }],
  videoAttachmentId: { type: String, default: '' },
  fileAttachmentId:  { type: String, default: '' },
  adminNote:         { type: String, default: '' },
  linkUrl:           { type: String, default: '' },
  linkTitle:         { type: String, default: '' },
  scheduledAt:       { type: Date, required: true },
  status:            { type: String, enum: ['pending', 'sending', 'sent', 'failed', 'cancelled'], default: 'pending' },
  createdBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', required: true },
  createdAt:         { type: Date, default: Date.now },
  sentAt:            { type: Date, default: null },
  result:            {
    sent:   { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
  },
});

module.exports = mongoose.model('ScheduledMessage', scheduledMessageSchema);
