const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId:      { type: String, required: true, index: true },
  displayName: { type: String, default: '' },
  contact:     { type: String, required: true },
  content:     { type: String, required: true },
  imageUrl:    { type: String, default: '' },
  status:      { type: String, enum: ['pending', 'processing', 'done'], default: 'pending' },
  createdAt:   { type: Date, default: Date.now },
  assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', default: null },
  response:    { type: String, default: '' },
  respondedAt: { type: Date, default: null },
  respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', default: null },
  note:        { type: String, default: '' },
  updatedAt:   { type: Date, default: null },
});

module.exports = mongoose.model('Feedback', feedbackSchema);
