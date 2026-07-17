const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const PushSubscription = require('../models/PushSubscription');
const EmailToken = require('../models/EmailToken');
const Feedback = require('../models/Feedback');
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
    const email = (profile.emails[0].value || '').toLowerCase();
    let user = await User.findOne({ googleId: profile.id });

    // No googleId match: look up by email before creating anything. Skipping
    // this used to mint a SECOND account for an address that already had a
    // password account — and the magic-link lookup (findOne by email) would
    // then resolve ambiguously between them.
    if (!user) {
      const byEmail = await User.findOne({ email });
      if (byEmail) {
        // Google has verified this address, so its owner is standing right
        // here. If the existing account was never confirmed but carries a
        // password, it was a squatter — drop their password so the verified
        // owner takes sole control.
        if (!byEmail.emailVerified && byEmail.passwordHash) byEmail.passwordHash = undefined;
        byEmail.googleId = profile.id;
        byEmail.emailVerified = true;
        if (!byEmail.name) byEmail.name = profile.displayName;
        if (!byEmail.avatar) byEmail.avatar = profile.photos[0]?.value;
        await byEmail.save();
        user = byEmail;
      }
    }

    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email,
        name: profile.displayName,
        avatar: profile.photos[0]?.value,
        emailVerified: true, // Google vouches for the address
      });
      notifyAdmin('🎉 New RenewBell signup', `${profile.displayName} <${email}> just signed up.`);
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

// ── Email + password sign-up / sign-in ───────────────────────────────────────
// The primary non-Google flow: register once with a password, then sign in
// with it any time (no link required). The magic link remains as the
// "forgot password / passwordless" fallback.

const issueSession = (user) => jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Demo/review logins (Google Play reviewers) can't receive mail, so they skip
// the verification step. Everything else must confirm the address.
const skipsVerification = (email) => authMiddleware.isDemoEmail(email);

async function sendVerificationEmail(email) {
  const token = jwt.sign({ email, verify: true }, process.env.JWT_SECRET, { expiresIn: '24h' });
  const frontend = (process.env.FRONTEND_URL || 'https://renewbell.app').replace(/\/$/, '');
  // Token rides in the URL fragment: fragments are never sent to a server, so
  // it stays out of logs and Referer headers, and link-prefetching scanners
  // only fetch the page HTML without running the JS that redeems it.
  const link = `${frontend}/auth/verify#t=${token}`;
  return sendEmail(
    email,
    'Confirm your RenewBell email',
    `Confirm your email address to finish creating your RenewBell account (valid for 24 hours):\n\n${link}\n\nIf you didn't sign up, you can ignore this email.`,
    `<div style="font-family:sans-serif;max-width:480px">
      <h2 style="color:#0F172A">Confirm your email</h2>
      <p>Tap the button below to finish creating your RenewBell account. This link is valid for <strong>24 hours</strong>.</p>
      <p style="margin:24px 0"><a href="${link}" style="background:#06B6D4;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:bold">Confirm my email</a></p>
      <p style="color:#64748B;font-size:13px">If you didn't sign up for RenewBell, you can safely ignore this email.</p>
    </div>`
  );
}

router.post('/register', async (req, res) => {
  try {
    const email = (req.body.email || '').toString().trim().toLowerCase();
    const password = (req.body.password || '').toString();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const existing = await User.findOne({ email });
    // A verified account owns its address — never let the login page attach a
    // new password to it. Unverified ones are nobody's yet (an unconfirmed
    // signup or a squatter), so re-registering may reset the pending password;
    // whoever actually confirms the address ends up owning it.
    if (existing && existing.emailVerified) {
      return res.status(409).json({ error: 'An account with this email already exists — sign in instead.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verified = skipsVerification(email);
    let user = existing;
    if (user) {
      user.passwordHash = passwordHash;
      user.emailVerified = verified;
      await user.save();
    } else {
      user = await User.create({
        googleId: `email:${email}`,
        email,
        name: email.split('@')[0],
        passwordHash,
        emailVerified: verified,
      });
    }

    if (verified) {
      notifyAdmin('🎉 New RenewBell signup (demo/review)', `${email} signed up (verification skipped).`);
      return res.json({ token: issueSession(user) });
    }

    const sent = await sendVerificationEmail(email);
    if (!sent) return res.status(503).json({ error: 'Could not send the confirmation email. Please try again.' });
    // Deliberately no session token — the account is inert until confirmed.
    res.json({ ok: true, verificationRequired: true });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.post('/login', async (req, res) => {
  try {
    const email = (req.body.email || '').toString().trim().toLowerCase();
    const password = (req.body.password || '').toString();
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'No account found with this email.' });
    if (!user.passwordHash) return res.status(401).json({ error: 'This account has no password — use Google or the email link, then set one in Settings.' });
    if (!(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Incorrect password.' });
    if (!user.emailVerified && !skipsVerification(email)) {
      return res.status(403).json({ error: 'Please confirm your email first — check your inbox for the link.', verificationRequired: true });
    }
    res.json({ token: issueSession(user) });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// Redeem the emailed confirmation link, then sign the user straight in.
router.post('/verify-email', async (req, res) => {
  try {
    const payload = jwt.verify(req.body.token, process.env.JWT_SECRET);
    if (!payload.verify || !payload.email) return res.status(400).json({ error: 'Invalid link' });
    const user = await User.findOne({ email: payload.email });
    if (!user) return res.status(400).json({ error: 'Account no longer exists — please sign up again.' });
    if (!user.emailVerified) {
      user.emailVerified = true;
      await user.save();
      notifyAdmin('🎉 New RenewBell signup (email confirmed)', `${user.email} confirmed their email and activated their account.`);
    }
    res.json({ token: issueSession(user) });
  } catch { res.status(400).json({ error: 'That link is invalid or has expired — request a new one.' }); }
});

router.post('/resend-verification', async (req, res) => {
  try {
    const email = (req.body.email || '').toString().trim().toLowerCase();
    const user = await User.findOne({ email });
    // Always report success: revealing which addresses exist would leak the
    // user list to anyone probing this endpoint.
    if (!user || user.emailVerified) return res.json({ ok: true });
    await sendVerificationEmail(email);
    res.json({ ok: true });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// Authenticated: set or change the password (also how Google/magic-link
// accounts add one)
router.post('/set-password', authMiddleware, async (req, res) => {
  try {
    const password = (req.body.password || '').toString();
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    await User.updateOne({ _id: req.user._id }, { passwordHash: await bcrypt.hash(password, 10) });
    res.json({ ok: true });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ── Email (magic link) sign-in — for users without a Google account ─────────
router.post('/email/start', async (req, res) => {
  try {
    const email = (req.body.email || '').toString().trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address' });
    // Sign-in and sign-up are separate flows: signing in to an email nobody
    // registered should say so, not silently create an account.
    const mode = req.body.mode === 'signup' ? 'signup' : 'signin';
    const existing = await User.findOne({ email });
    if (mode === 'signin' && !existing) {
      return res.status(404).json({ error: 'No account found with this email. Switch to "Create account" to sign up first.' });
    }
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
    // Creating an account vs signing in gets matching email copy; a signup
    // attempt for an existing account just gets a sign-in link (the client
    // is told via `existing` so it can explain).
    const creating = mode === 'signup' && !existing;
    const subject = creating ? 'Create your RenewBell account' : 'Your RenewBell sign-in link';
    const action = creating ? 'create your account' : 'sign in';
    const button = creating ? 'Create my account' : 'Sign in to RenewBell';
    const ok = await sendEmail(
      email,
      subject,
      `Click to ${action} (link is valid for 15 minutes):\n\n${link}\n\nIf you didn't request this, you can safely ignore this email.`,
      `<div style="font-family:sans-serif;max-width:480px">
        <h2 style="color:#0F172A">${creating ? 'Welcome to RenewBell' : 'Sign in to RenewBell'}</h2>
        <p>Click the button below to ${action}. This link is valid for <strong>15 minutes</strong> and can be used once.</p>
        <p style="margin:24px 0"><a href="${link}" style="background:#06B6D4;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:bold">${button}</a></p>
        <p style="color:#64748B;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
      </div>`
    );
    if (!ok) return res.status(503).json({ error: 'Could not send email right now. Please try again.' });
    res.json({ ok: true, existing: !!existing });
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
      emailVerified: true, // they opened a link sent to this address
    });
    notifyAdmin('🎉 New RenewBell signup (email)', `${p.email} just signed up via email link.`);
  } else if (!user.emailVerified) {
    // Receiving this link proves ownership. If the unconfirmed account also
    // carries a password, a squatter set it — clear it so the real owner
    // isn't sharing the account with them.
    if (user.passwordHash) user.passwordHash = undefined;
    user.emailVerified = true;
    await user.save();
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
    res.json({ id: _id, email, name, avatar, plan, premiumActivatedAt, premiumExpiresAt, hasPassword: !!user.passwordHash });
  } catch { res.status(500).json({ error: 'Server error' }); }
});
router.post('/logout', (req, res) => res.json({ message: 'Logged out' }));

// Permanently deletes the user's account and all associated data
// (subscriptions, push registration) — required by Apple/Google account
// deletion policies for apps that support account creation.
router.delete('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    await Promise.all([
      Subscription.deleteMany({ user: userId }),
      PushSubscription.deleteMany({ user: userId }),
      // Live Gmail/Outlook OAuth tokens — leaving these behind would keep
      // mailbox access for an account that no longer exists.
      EmailToken.deleteMany({ user: userId }),
      // Feedback carries the sender's email; drop it with the account.
      Feedback.deleteMany({ user: userId }),
    ]);
    await User.findByIdAndDelete(userId);
    res.json({ message: 'Account deleted' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
