const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  displayName: { type: String, default: '' },
  contact: { type: String, required: true },
  content: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'processing', 'done'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Feedback', feedbackSchema);
