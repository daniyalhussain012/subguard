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
  // Best-effort signup location for the admin list — ISO-3166 alpha-2 from the
  // CDN edge header, with the browser's timezone as a softer secondary signal.
  // Never blocks anything; absent for accounts created before this shipped
  // until they next open the app (see the backfill in /auth/me).
  country: String,
  timezone: String,
  stripeCustomerId: String,
  stripeSessionId: String,
  premiumActivatedAt: Date,
  premiumExpiresAt: Date,
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);
