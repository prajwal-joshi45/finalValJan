const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  originalLink: { type: String, required: true },
  shortId: { type: String, required: true, unique: true },
  shortLink: { type: String, required: true, unique: true },
  remarks: String,
  clicks: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  expirationDate: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Link', linkSchema);
