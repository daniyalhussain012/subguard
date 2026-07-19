const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: String,
  plan: String,
  message: { type: String, required: true, maxlength: 2000 },
  // Founder's reply, shown back to the user in Settings. `repliedAt` doubles as
  // the "Responded?" flag in the admin list; `replyReadAt` drives the unread
  // badge and is stamped when the user opens their feedback thread.
  reply: { type: String, maxlength: 4000 },
  repliedAt: Date,
  replyReadAt: Date,
}, { timestamps: true });
module.exports = mongoose.model('Feedback', schema);
