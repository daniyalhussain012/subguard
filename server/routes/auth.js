const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const PushSubscription = require('../models/PushSubscription');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

console.log('[Auth] Initializing Google Strategy');
console.log('[Auth] GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.slice(0, 20) + '...' : 'MISSING');
console.log('[Auth] GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '****' + process.env.GOOGLE_CLIENT_SECRET.slice(-4) : 'MISSING');
console.log('[Auth] GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI || 'MISSING');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_REDIRECT_URI,
  proxy: true,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        avatar: profile.photos[0]?.value,
      });
    }
    done(null, user);
  } catch (err) { done(err, null); }
}));
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try { done(null, await User.findById(id)); } catch (err) { done(err, null); }
});

router.get('/login/google', (req, res, next) => {
  console.log('[Auth] Login initiated');
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/login/google/callback', (req, res, next) => {
  console.log('[Auth] Callback received - code:', req.query.code ? 'present' : 'MISSING', '| state:', req.query.state ? 'present' : 'missing', '| error:', req.query.error || 'none');
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) {
      console.error('[Auth] Token exchange error:', {
        name: err.name,
        message: err.message,
        code: err.code,
        status: err.status,
        oauthError: err.oauthError ? JSON.stringify(err.oauthError) : undefined,
      });
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
    if (!user) {
      console.error('[Auth] No user returned, info:', JSON.stringify(info));
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
    console.log('[Auth] Success! User:', user.email);
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  })(req, res, next);
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    let user = req.user;
    if (user.plan === 'premium' && user.premiumExpiresAt && new Date() > new Date(user.premiumExpiresAt)) {
      user = await User.findByIdAndUpdate(user._id, { plan: 'free' }, { new: true });
    }
    const { _id, email, name, avatar, plan, premiumActivatedAt, premiumExpiresAt } = user;
    res.json({ id: _id, email, name, avatar, plan, premiumActivatedAt, premiumExpiresAt });
  } catch { res.status(500).json({ error: 'Server error' }); }
});
router.post('/logout', (req, res) => res.json({ message: 'Logged out' }));

// Permanently deletes the user's account and all associated data
// (subscriptions, push registration) — required by Apple/Google account
// deletion policies for apps that support account creation.
router.delete('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    await Subscription.deleteMany({ user: userId });
    await PushSubscription.deleteOne({ user: userId });
    await User.findByIdAndDelete(userId);
    res.json({ message: 'Account deleted' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
