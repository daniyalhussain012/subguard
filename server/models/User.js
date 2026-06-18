const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: String,
  avatar: String,
  plan: { type: String, enum: ['free','premium'], default: 'free' },
  stripeCustomerId: String,
  stripeSessionId: String,
  premiumActivatedAt: Date,
  premiumExpiresAt: Date,
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);
