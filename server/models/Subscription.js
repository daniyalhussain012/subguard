const mongoose = require('mongoose');
const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  billingCycle: { type: String, enum: ['monthly','yearly','weekly'], default: 'monthly' },
  category: { type: String, default: 'Other' },
  nextBillingDate: Date,
  isActive: { type: Boolean, default: true },
  notes: String,
}, { timestamps: true });
module.exports = mongoose.model('Subscription', subscriptionSchema);
