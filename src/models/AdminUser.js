const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminUserSchema = new mongoose.Schema({
  username:  { type: String, required: true, unique: true, trim: true, lowercase: true },
  password:  { type: String, required: true },
  fullName:  { type: String, required: true, trim: true },
  role:      { type: String, enum: ['superadmin', 'staff'], default: 'staff' },
  createdAt: { type: Date, default: Date.now },
});

adminUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminUserSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('AdminUser', adminUserSchema);
