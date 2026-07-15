const express = require('express');
const crypto = require('crypto');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const PushSubscription = require('../models/PushSubscription');
const authMiddleware = require('../middleware/auth');
const { notifyAdmin, sendEmail } = require('../notify');
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
      notifyAdmin('🎉 New RenewBell signup', `${profile.displayName} <${profile.emails[0].value}> just signed up.`);
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

// ── Email (magic link) sign-in — for users without a Google account ─────────
router.post('/email/start', async (req, res) => {
  try {
    const email = (req.body.email || '').toString().trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address' });
    const token = jwt.sign(
      { email, magic: true, jti: crypto.randomUUID() },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    // Link goes to a FRONTEND page with the token in the URL fragment:
    // fragments are never sent to any server (no logs, no Referer) and email
    // security scanners that prefetch links only GET the page HTML — they
    // don't run the JS that redeems the token, so the single-use code
    // survives until the real user's browser opens it.
    const frontend = (process.env.FRONTEND_URL || 'https://renewbell.app').replace(/\/$/, '');
    const link = `${frontend}/auth/email#t=${token}`;
    const ok = await sendEmail(
      email,
      'Your RenewBell sign-in link',
      `Click to sign in to RenewBell (link is valid for 15 minutes):\n\n${link}\n\nIf you didn't request this, you can safely ignore this email.`,
      `<div style="font-family:sans-serif;max-width:480px">
        <h2 style="color:#0F172A">Sign in to RenewBell</h2>
        <p>Click the button below to sign in. This link is valid for <strong>15 minutes</strong> and can be used once.</p>
        <p style="margin:24px 0"><a href="${link}" style="background:#06B6D4;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:bold">Sign in to RenewBell</a></p>
        <p style="color:#64748B;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
      </div>`
    );
    if (!ok) return res.status(503).json({ error: 'Could not send email right now. Please try again.' });
    res.json({ ok: true });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

async function redeemMagicToken(rawToken) {
  const p = jwt.verify(rawToken, process.env.JWT_SECRET);
  if (!p.magic || !p.jti || usedCodes.has(p.jti)) throw new Error('invalid');
  usedCodes.set(p.jti, Date.now() + 16 * 60000); // single-use
  let user = await User.findOne({ email: p.email });
  if (!user) {
    user = await User.create({
      // googleId is required+unique in the schema; email users get a
      // deterministic placeholder so the constraint still holds
      googleId: `email:${p.email}`,
      email: p.email,
      name: p.email.split('@')[0],
    });
    notifyAdmin('🎉 New RenewBell signup (email)', `${p.email} just signed up via email link.`);
  }
  return user;
}

// Primary path: the frontend /auth/email page POSTs the fragment token here
// and receives the session token directly — no redirect hops to break.
router.post('/email/verify', async (req, res) => {
  try {
    const user = await redeemMagicToken(req.body.token);
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token });
  } catch { res.status(400).json({ error: 'Invalid or expired link' }); }
});

// Legacy path for links sent before the fragment flow shipped
router.get('/email/verify', async (req, res) => {
  try {
    const user = await redeemMagicToken(req.query.token);
    const code = jwt.sign(
      { userId: user._id, otc: true, jti: crypto.randomUUID() },
      process.env.JWT_SECRET,
      { expiresIn: '60s' }
    );
    return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?code=${code}`);
  } catch {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=email_link_invalid`);
  }
});

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
