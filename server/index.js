require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const cron = require('node-cron');
const webpush = require('web-push');
const connectDB = require('./db');
const User = require('./models/User');
const Subscription = require('./models/Subscription');
const PushSubscription = require('./models/PushSubscription');
const gmail = require('./gmail');
const outlook = require('./outlook');

const app = express();
connectDB();

const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://subguard-five.vercel.app').replace(/\/$/, '');

// Allow both the old and new app domains during the RenewBell transition,
// so PWAs installed from the old URL keep working.
const ALLOWED_ORIGINS = [...new Set([
  FRONTEND_URL,
  'https://renewbell.vercel.app',
  'https://subguard-five.vercel.app',
  'http://localhost:5173',
])];
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || ALLOWED_ORIGINS.includes(origin)),
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
      expiresAt.setFullYear(expiresAt.getFullYear() + 5);
      await User.findByIdAndUpdate(metadata.userId, {
        plan: 'premium',
        stripeSessionId: id,
        premiumActivatedAt: new Date(),
        premiumExpiresAt: expiresAt,
      });
    }
  }
  res.json({ received: true });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET || 'subguard-secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// ── App auth + subscriptions + stripe + push ──────────────────────────────────
app.use('/auth', require('./routes/auth'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/stripe', require('./routes/stripe'));
app.use('/api', require('./routes/push'));

// ── Email scanning status ─────────────────────────────────────────────────────
app.get('/api/status', (req, res) => {
  res.json({ ok: true, gmail: gmail.getStatus(), outlook: outlook.getStatus() });
});

// ── Gmail email scanning ──────────────────────────────────────────────────────
app.get('/auth/google', (req, res) => {
  if (!gmail.isConfigured()) return res.redirect(`${FRONTEND_URL}/scanner?error=gmail_not_configured`);
  res.redirect(gmail.getAuthUrl());
});

app.get('/auth/google/callback', async (req, res) => {
  const { code, error } = req.query;
  if (error || !code) return res.redirect(`${FRONTEND_URL}/scanner?error=gmail_denied`);
  try {
    await gmail.handleCallback(code);
    res.redirect(`${FRONTEND_URL}/scanner?connected=gmail`);
  } catch (err) {
    console.error('Gmail callback error:', err.message);
    res.redirect(`${FRONTEND_URL}/scanner?error=gmail_failed`);
  }
});

app.post('/api/scan-gmail', async (req, res) => {
  try { res.json({ ok: true, results: await gmail.scanGmail() }); }
  catch (err) { res.status(400).json({ ok: false, error: err.message }); }
});

app.get('/api/gmail-status', (req, res) => res.json(gmail.getStatus()));
app.post('/api/disconnect-gmail', (req, res) => { gmail.disconnect(); res.json({ ok: true }); });

// ── Outlook email scanning ────────────────────────────────────────────────────
app.get('/auth/microsoft', (req, res) => {
  if (!outlook.isConfigured()) return res.redirect(`${FRONTEND_URL}/scanner?error=outlook_not_configured`);
  res.redirect(outlook.getAuthUrl());
});

app.get('/auth/microsoft/callback', async (req, res) => {
  const { code, error } = req.query;
  if (error || !code) return res.redirect(`${FRONTEND_URL}/scanner?error=outlook_denied`);
  try {
    await outlook.handleCallback(code);
    res.redirect(`${FRONTEND_URL}/scanner?connected=outlook`);
  } catch (err) {
    console.error('Outlook callback error:', err.message);
    res.redirect(`${FRONTEND_URL}/scanner?error=outlook_failed`);
  }
});

app.post('/api/scan-outlook', async (req, res) => {
  try { res.json({ ok: true, results: await outlook.scanOutlook() }); }
  catch (err) { res.status(400).json({ ok: false, error: err.message }); }
});

app.get('/api/outlook-status', (req, res) => res.json(outlook.getStatus()));
app.post('/api/disconnect-outlook', (req, res) => { outlook.disconnect(); res.json({ ok: true }); });

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

      const pushSub = await PushSubscription.findOne({ user: sub.user });
      if (!pushSub) continue;

      const payload = JSON.stringify({
        title: stage.title(sub),
        body: stage.body(sub),
        tag: `renewal-${sub._id}-${stage.days}`,
        url: '/',
        subId: sub._id.toString(),
        renewalDate: forDate,
        stage: stage.days,
      });

      try {
        await webpush.sendNotification(pushSub.subscription, payload);
        // Mark stage as sent for this billing date
        const prev = sub.notifsSent?.forDate === forDate ? sub.notifsSent : { forDate, s7: false, s2: false, s1: false };
        await Subscription.findByIdAndUpdate(sub._id, {
          notifsSent: { ...prev, forDate, [stage.key]: true },
        });
        sent++;
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription gone from device — remove it
          await PushSubscription.deleteOne({ user: sub.user });
        } else {
          console.error(`[Push Cron] Failed to send to user ${sub.user}:`, err.message);
        }
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
