const mongoose = require('mongoose');
// Per-user OAuth tokens for inbox scanning (Gmail / Outlook). Persisted so
// connections survive deploys and are isolated between users.
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: String, enum: ['gmail', 'outlook'], required: true },
  tokens: { type: Object, required: true },
  email: String,
}, { timestamps: true });
schema.index({ user: 1, provider: 1 }, { unique: true });
module.exports = mongoose.model('EmailToken', schema);
