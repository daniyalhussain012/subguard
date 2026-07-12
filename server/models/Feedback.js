const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: String,
  plan: String,
  message: { type: String, required: true, maxlength: 2000 },
}, { timestamps: true });
module.exports = mongoose.model('Feedback', schema);
