const mongoose = require('mongoose');
const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  billingCycle: { type: String, default: 'Monthly' },
  category: { type: String, default: 'Other' },
  nextBillingDate: Date,
  isActive: { type: Boolean, default: true },
  notes: String,
  notifsSent: {
    forDate: String,
    s7: { type: Boolean, default: false },
    s2: { type: Boolean, default: false },
    s1: { type: Boolean, default: false },
  },
}, { timestamps: true });
module.exports = mongoose.model('Subscription', subscriptionSchema);
