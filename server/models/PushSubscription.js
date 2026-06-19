const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  subscription: { type: Object, required: true },
  updatedAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('PushSubscription', schema);
