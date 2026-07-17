const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, index: true },
  // Proof the signup actually controls this address. Google sign-in and
  // magic-link both prove it inherently; password signup must confirm by
  // email. Guards against squatting on someone else's address.
  emailVerified: { type: Boolean, default: false },
  passwordHash: String, // set for email+password accounts; absent for Google/magic-link-only
  name: String,
  avatar: String,
  plan: { type: String, enum: ['free','premium'], default: 'free' },
  stripeCustomerId: String,
  stripeSessionId: String,
  premiumActivatedAt: Date,
  premiumExpiresAt: Date,
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);
