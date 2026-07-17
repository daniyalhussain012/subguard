require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const cron = require('node-cron');
const webpush = require('web-push');
const jwt = require('jsonwebtoken');
const connectDB = require('./db');
const User = require('./models/User');
const Subscription = require('./models/Subscription');
const PushSubscription = require('./models/PushSubscription');
const EmailToken = require('./models/EmailToken');
const Feedback = require('./models/Feedback');
const authMiddleware = require('./middleware/auth');
const { notifyAdmin } = require('./notify');
const gmail = require('./gmail');
const outlook = require('./outlook');

const app = express();
connectDB();
// Drop stale indexes from the old one-device-per-user push design
// (unique index on `user` alone would reject a second device).
PushSubscription.syncIndexes().catch(err => console.error('[Startup] PushSubscription index sync failed:', err.message));

// Accounts created before email verification existed have no emailVerified
// field, which would read as false and lock them out of password sign-in.
// Grandfather them in. Idempotent, so it's a no-op on every later boot.
User.updateMany({ emailVerified: { $exists: false } }, { $set: { emailVerified: true } })
  .then(r => { if (r.modifiedCount) console.log(`[Startup] Grandfathered ${r.modifiedCount} pre-existing account(s) as email-verified.`); })
  .catch(err => console.error('[Startup] emailVerified backfill failed:', err.message));

const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://subguard-five.vercel.app').replace(/\/$/, '');

// Allow both the old and new app domains during the RenewBell transition,
// so PWAs installed from the old URL keep working.
const ALLOWED_ORIGINS = [...new Set([
  FRONTEND_URL,
  'https://renewbell.app',
  'https://www.renewbell.app',
  'https://renewbell.vercel.app',
  'https://subguard-five.vercel.app',
  'http://localhost:5173',
])];
app.use(cors({
  // Strict allowlist only — no !origin escape hatch. Non-browser clients
  // (curl, health checks) don't need CORS headers to succeed anyway.
  origin: (origin, cb) => cb(null, ALLOWED_ORIGINS.includes(origin)),
  credentials: true,
}));

// ── Stripe webhook (must come BEFORE json body parser) ───────────────────────
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) { return res.status(400).send(`Webhook error: ${err.message}`); }

  if (event.type === 'checkout.session.completed') {
    const { metadata, id } = event.data.object;
    if (metadata?.userId) {
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 3);
      const user = await User.findByIdAndUpdate(metadata.userId, {
        plan: 'premium',
        stripeSessionId: id,
        premiumActivatedAt: new Date(),
        premiumExpiresAt: expiresAt,
      }, { new: true });
      notifyAdmin('💰 New RenewBell Pro purchase ($10)', `${user?.name || 'Unknown'} <${user?.email || metadata.userId}> upgraded to Pro (3-year access).`);
    }
  }
  res.json({ received: true });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Never fall back to a secret that's public in the repo. If the env var is
// missing, use a random per-boot secret (sessions only span the seconds-long
// OAuth handshake, so losing them on restart is harmless) and log loudly.
const sessionSecret = process.env.SESSION_SECRET || (() => {
  console.warn('[Startup] SESSION_SECRET not set — using a random per-boot secret. Set it in the environment.');
  return require('crypto').randomBytes(32).toString('hex');
})();
app.use(session({ secret: sessionSecret, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// ── App auth + subscriptions + stripe + push ──────────────────────────────────
app.use('/auth', require('./routes/auth'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/stripe', require('./routes/stripe'));
app.use('/api', require('./routes/push'));

// ── Email scanning (per-user tokens in MongoDB) ───────────────────────────────
// Connect flow: the browser navigates to /auth/<provider>?token=<app JWT>
// (navigations can't carry Authorization headers), we swap it for a short-lived
// signed `state`, and the OAuth callback maps state → user to store tokens.

const signScanState = (userId, provider) =>
  jwt.sign({ uid: userId.toString(), scan: provider }, process.env.JWT_SECRET, { expiresIn: '15m' });

function verifyScanState(state, provider) {
  const payload = jwt.verify(state, process.env.JWT_SECRET);
  if (payload.scan !== provider) throw new Error('State/provider mismatch');
  return payload.uid;
}

function userIdFromQueryToken(req) {
  return jwt.verify(req.query.token, process.env.JWT_SECRET).userId;
}

app.get('/api/status', authMiddleware, async (req, res) => {
  try {
    const docs = await EmailToken.find({ user: req.user._id });
    const doc = p => docs.find(d => d.provider === p);
    const status = p => ({ configured: (p === 'gmail' ? gmail : outlook).isConfigured(), connected: !!doc(p), email: doc(p)?.email || null });
    res.json({ ok: true, gmail: status('gmail'), outlook: status('outlook') });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

function registerScanProvider(name, provider, mod) {
  // name: URL segment for OAuth routes (google/microsoft); provider: gmail/outlook
  app.get(`/auth/${name}`, async (req, res) => {
    if (!mod.isConfigured()) return res.redirect(`${FRONTEND_URL}/scanner?error=${provider}_not_configured`);
    let user;
    try {
      user = authMiddleware.applyAdminOverride(await User.findById(userIdFromQueryToken(req)));
      if (!user) throw new Error('no user');
    } catch { return res.redirect(`${FRONTEND_URL}/scanner?error=${provider}_auth`); }
    // Email scanning is a premium feature — enforce it where the value lives
    if (user.plan !== 'premium') return res.redirect(`${FRONTEND_URL}/upgrade`);
    res.redirect(mod.getAuthUrl(signScanState(user._id, provider)));
  });

  app.get(`/auth/${name}/callback`, async (req, res) => {
    const { code, state, error } = req.query;
    if (error || !code) return res.redirect(`${FRONTEND_URL}/scanner?error=${provider}_denied`);
    try {
      const userId = verifyScanState(state, provider);
      const { tokens, email } = await mod.handleCallback(code);
      await EmailToken.findOneAndUpdate(
        { user: userId, provider },
        { tokens, email },
        { upsert: true }
      );
      res.redirect(`${FRONTEND_URL}/scanner?connected=${provider}`);
    } catch (err) {
      console.error(`${provider} callback error:`, err.message);
      res.redirect(`${FRONTEND_URL}/scanner?error=${provider}_failed`);
    }
  });

  app.post(`/api/scan-${provider}`, authMiddleware, async (req, res) => {
    try {
      if (req.user.plan !== 'premium') return res.status(403).json({ ok: false, error: 'Email scanning requires Premium' });
      const doc = await EmailToken.findOne({ user: req.user._id, provider });
      if (!doc) return res.status(400).json({ ok: false, error: `Not connected to ${provider}` });
      const scan = provider === 'gmail' ? mod.scanGmail : mod.scanOutlook;
      const since = doc.lastScanAt || null;
      const scanStartedAt = new Date();
      const { results, updatedTokens } = await scan(doc.tokens, since);
      const update = { lastScanAt: scanStartedAt };
      if (updatedTokens) update.tokens = updatedTokens;
      await EmailToken.updateOne({ _id: doc._id }, update);
      res.json({ ok: true, results, since });
    } catch (err) { res.status(400).json({ ok: false, error: err.message }); }
  });

  app.get(`/api/${provider}-status`, authMiddleware, async (req, res) => {
    const doc = await EmailToken.findOne({ user: req.user._id, provider });
    res.json({ configured: mod.isConfigured(), connected: !!doc, email: doc?.email || null });
  });

  app.post(`/api/disconnect-${provider}`, authMiddleware, async (req, res) => {
    await EmailToken.deleteOne({ user: req.user._id, provider });
    res.json({ ok: true });
  });
}

registerScanProvider('google', 'gmail', gmail);
registerScanProvider('microsoft', 'outlook', outlook);

// ── Admin: signup & subscription tracking ─────────────────────────────────────
// Only accounts listed in ADMIN_EMAILS can read this.
app.get('/api/admin/users', authMiddleware, async (req, res) => {
  try {
    if (!authMiddleware.isAdminEmail(req.user.email)) return res.status(403).json({ error: 'Forbidden' });
    const users = await User.find({}, 'name email plan createdAt premiumActivatedAt premiumExpiresAt')
      .sort({ createdAt: -1 }).limit(200);
    const total = await User.countDocuments();
    const pro = await User.countDocuments({ plan: 'premium' });
    const feedbackCount = await Feedback.countDocuments();
    res.json({ total, pro, free: total - pro, feedbackCount, users });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ── Feedback ──────────────────────────────────────────────────────────────────
app.post('/api/feedback', authMiddleware, async (req, res) => {
  try {
    const message = (req.body.message || '').toString().trim().slice(0, 2000);
    if (!message) return res.status(400).json({ error: 'Message required' });
    await Feedback.create({ user: req.user._id, email: req.user.email, plan: req.user.plan, message });
    notifyAdmin(
      '💬 New RenewBell feedback',
      `From: ${req.user.name || 'Unknown'} <${req.user.email}> (${req.user.plan})\n\n${message}`
    );
    res.json({ ok: true });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ── Daily push notification cron ──────────────────────────────────────────────

async function sendRenewalPushNotifications() {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.log('[Push Cron] VAPID keys not configured, skipping.');
    return;
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:support@renewbell.app',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stages = [
    { days: 7, title: s => `🔔 ${s.name} renews in 1 week`, body: s => `${s.currency || 'USD'} ${s.amount} will be charged in 7 days. Open RenewBell to manage.`, key: 's7' },
    { days: 2, title: s => `⚠️ ${s.name} renews in 2 days`, body: s => `${s.currency || 'USD'} ${s.amount} charges in 2 days. Keep or cancel?`, key: 's2' },
    { days: 1, title: s => `🚨 Final reminder: ${s.name} renews TOMORROW`, body: s => `${s.currency || 'USD'} ${s.amount} charges tomorrow. Last chance to cancel.`, key: 's1' },
  ];

  let sent = 0;
  let skipped = 0;

  for (const stage of stages) {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + stage.days);
    const dateStart = new Date(targetDate);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(targetDate);
    dateEnd.setHours(23, 59, 59, 999);

    const subs = await Subscription.find({
      isActive: true,
      nextBillingDate: { $gte: dateStart, $lte: dateEnd },
    });

    for (const sub of subs) {
      // Skip if already sent for this billing date
      const forDate = dateStart.toISOString().split('T')[0];
      if (sub.notifsSent?.forDate === forDate && sub.notifsSent?.[stage.key]) {
        skipped++;
        continue;
      }

      const devices = await PushSubscription.find({ user: sub.user });
      if (!devices.length) continue;

      const payload = JSON.stringify({
        title: stage.title(sub),
        body: stage.body(sub),
        tag: `renewal-${sub._id}-${stage.days}`,
        url: '/',
        subId: sub._id.toString(),
        renewalDate: forDate,
        stage: stage.days,
      });

      // Deliver to every registered device; drop only the devices that are gone
      let deliveredToAny = false;
      for (const device of devices) {
        try {
          await webpush.sendNotification(device.subscription, payload);
          deliveredToAny = true;
        } catch (err) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await PushSubscription.deleteOne({ _id: device._id });
          } else {
            console.error(`[Push Cron] Failed to send to user ${sub.user}:`, err.message);
          }
        }
      }
      if (deliveredToAny) {
        // Mark stage as sent for this billing date
        const prev = sub.notifsSent?.forDate === forDate ? sub.notifsSent : { forDate, s7: false, s2: false, s1: false };
        await Subscription.findByIdAndUpdate(sub._id, {
          notifsSent: { ...prev, forDate, [stage.key]: true },
        });
        sent++;
      }
    }
  }

  console.log(`[Push Cron] Done. Sent: ${sent}, Skipped (already sent): ${skipped}`);
  return { sent, skipped };
}

// ── HTTP trigger for external cron (works even when Render is sleeping) ────────
// Call this from cron-job.org daily to wake the server AND fire push notifications.
// Protected by CRON_SECRET env var to prevent unauthorized calls.
async function handleTriggerPush(req, res) {
  const secret = process.env.CRON_SECRET;
  const provided = req.headers['x-cron-secret'] || req.query.secret;
  if (secret && provided !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  console.log('[Push Trigger] HTTP trigger called');
  sendRenewalPushNotifications()
    .then(result => res.json({ ok: true, ...result }))
    .catch(err => {
      console.error('[Push Trigger] Error:', err.message);
      res.status(500).json({ ok: false, error: err.message });
    });
}

// Accept both GET and POST so cron-job.org works with default settings (no method/header config needed)
app.get('/api/trigger-push', handleTriggerPush);
app.post('/api/trigger-push', handleTriggerPush);

// In-process cron as a fallback (only fires if server stays warm)
cron.schedule('0 8 * * *', () => {
  console.log('[Push Cron] Running daily renewal notifications...');
  sendRenewalPushNotifications().catch(err => console.error('[Push Cron] Error:', err.message));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`RenewBell server running on port ${PORT}`));
