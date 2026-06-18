require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const connectDB = require('./db');
const User = require('./models/User');
const gmail = require('./gmail');
const outlook = require('./outlook');

const app = express();
connectDB();

const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://subguard-five.vercel.app').replace(/\/$/, '');

app.use(cors({ origin: FRONTEND_URL, credentials: true }));

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

// ── App auth + subscriptions + stripe ────────────────────────────────────────
app.use('/auth', require('./routes/auth'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/stripe', require('./routes/stripe'));

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`SubGuard server running on port ${PORT}`));
