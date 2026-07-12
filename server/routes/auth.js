const express = require('express');
const crypto = require('crypto');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const PushSubscription = require('../models/PushSubscription');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Log presence only — never fragments of the actual values
console.log('[Auth] Google Strategy config:',
  process.env.GOOGLE_CLIENT_ID ? 'client id set' : 'CLIENT_ID MISSING',
  process.env.GOOGLE_CLIENT_SECRET ? '· secret set' : '· CLIENT_SECRET MISSING',
  process.env.GOOGLE_REDIRECT_URI ? '· redirect set' : '· REDIRECT_URI MISSING');

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
    // Don't put the long-lived JWT in the URL (it leaks via history, Referer,
    // and access logs). Redirect with a 60-second single-use code instead;
    // the SPA immediately exchanges it via POST for the real token.
    const code = jwt.sign(
      { userId: user._id, otc: true, jti: crypto.randomUUID() },
      process.env.JWT_SECRET,
      { expiresIn: '60s' }
    );
    return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?code=${code}`);
  })(req, res, next);
});

// Single-use tracking for exchange codes. In-memory is fine: codes live 60s
// and this runs as a single instance; a restart inside that window only means
// a code could be replayed for its remaining seconds.
const usedCodes = new Map(); // jti -> expiry ms
setInterval(() => {
  const now = Date.now();
  for (const [jti, exp] of usedCodes) if (exp < now) usedCodes.delete(jti);
}, 60000).unref();

router.post('/exchange', async (req, res) => {
  try {
    const payload = jwt.verify(req.body.code, process.env.JWT_SECRET);
    if (!payload.otc || !payload.jti) return res.status(400).json({ error: 'Invalid code' });
    if (usedCodes.has(payload.jti)) return res.status(400).json({ error: 'Code already used' });
    usedCodes.set(payload.jti, Date.now() + 120000);
    const token = jwt.sign({ userId: payload.userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token });
  } catch { res.status(400).json({ error: 'Invalid or expired code' }); }
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
