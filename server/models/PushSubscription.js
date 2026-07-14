const mongoose = require('mongoose');
// One document per DEVICE, not per user — a user can receive push on phone
// and desktop simultaneously. The endpoint uniquely identifies a device's
// browser push registration.
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  endpoint: { type: String, required: true },
  subscription: { type: Object, required: true },
  updatedAt: { type: Date, default: Date.now },
});
schema.index({ user: 1, endpoint: 1 }, { unique: true });
module.exports = mongoose.model('PushSubscription', schema);
