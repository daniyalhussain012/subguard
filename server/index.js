'use strict'

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const webpush = require('web-push')
const fs = require('fs')
const path = require('path')
const gmail = require('./gmail')
const outlook = require('./outlook')

const app = express()
const PORT = process.env.PORT || 3001
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

// ── VAPID ────────────────────────────────────────────────────────────────────

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BDYXEjQNp7YOnWdpmVr3jNXf8cR0oB4awm7yyVqnHQoJl1Cj27mzwZ-TDA_xRgPEPd9cVvfVH5wz-beyOH1MxfA'
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'hh_wyDQBNfiwygI8Dx9wZiJ9GgSk6QWADATn3RcSCr4'

webpush.setVapidDetails(
  'mailto:daniyalhussain987@hotmail.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
)

// ── Subscription Store ───────────────────────────────────────────────────────
// Persisted to /tmp/subguard_push.json (ephemeral on Render free tier, but
// survives within a session). Users re-enable push after server restarts.

const STORE_PATH = path.join('/tmp', 'subguard_push.json')

function loadStore() {
  try {
    if (fs.existsSync(STORE_PATH)) return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'))
  } catch {}
  return {}  // { [endpoint]: { subscription, subscriptions, updatedAt } }
}

function saveStore(store) {
  try { fs.writeFileSync(STORE_PATH, JSON.stringify(store), 'utf8') } catch {}
}

let pushStore = loadStore()

// ── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({ origin: FRONTEND_URL, credentials: true }))
app.use(express.json({ limit: '2mb' }))

// ── Status ───────────────────────────────────────────────────────────────────

app.get('/api/status', (req, res) => {
  res.json({
    ok: true,
    gmail: gmail.getStatus(),
    outlook: outlook.getStatus(),
    pushSubscribers: Object.keys(pushStore).length,
  })
})

// ── VAPID Public Key ─────────────────────────────────────────────────────────

app.get('/api/vapid-public-key', (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY })
})

// ── Push Subscribe ───────────────────────────────────────────────────────────

app.post('/api/push-subscribe', (req, res) => {
  const { subscription, subscriptions } = req.body
  if (!subscription?.endpoint) return res.status(400).json({ ok: false, error: 'Missing subscription' })

  pushStore[subscription.endpoint] = {
    subscription,
    subscriptions: subscriptions || [],
    updatedAt: new Date().toISOString(),
  }
  saveStore(pushStore)
  console.log(`Push subscriber registered. Total: ${Object.keys(pushStore).length}`)
  res.json({ ok: true })
})

// ── Push Unsubscribe ─────────────────────────────────────────────────────────

app.post('/api/push-unsubscribe', (req, res) => {
  const { endpoint } = req.body
  if (endpoint && pushStore[endpoint]) {
    delete pushStore[endpoint]
    saveStore(pushStore)
  }
  res.json({ ok: true })
})

// ── Update Subscription Data ──────────────────────────────────────────────────
// Called when subscriptions change in the app so push notifications stay accurate

app.post('/api/push-update-data', (req, res) => {
  const { endpoint, subscriptions } = req.body
  if (!endpoint || !pushStore[endpoint]) return res.status(404).json({ ok: false })
  pushStore[endpoint].subscriptions = subscriptions || []
  pushStore[endpoint].updatedAt = new Date().toISOString()
  saveStore(pushStore)
  res.json({ ok: true })
})

// ── Daily Notifications ───────────────────────────────────────────────────────
// Called by the internal cron job or externally to send due notifications.

function getDaysUntil(dateStr) {
  if (!dateStr) return Infinity
  const diff = new Date(dateStr).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)
  return Math.round(diff / 86400000)
}

async function sendPushToSubscriber(entry) {
  const { subscription, subscriptions } = entry
  const active = (subscriptions || []).filter(s => s.status === 'Active')

  for (const sub of active) {
    const days = getDaysUntil(sub.nextBillingDate)
    const amount = sub.billingCycle === 'Yearly'
      ? `$${(sub.amount / 12).toFixed(2)}/mo ($${parseFloat(sub.amount).toFixed(2)}/yr)`
      : `$${parseFloat(sub.amount).toFixed(2)}`

    let payload = null

    if (days === 7) {
      payload = {
        title: `\u{1F514} ${sub.name} renews in 1 week`,
        body: `${amount} will be charged on ${sub.nextBillingDate}. Tap to manage.`,
        tag: `stage1-${sub.id}-${sub.nextBillingDate}`,
        stage: 1,
        subId: sub.id,
        renewalDate: sub.nextBillingDate,
        url: '/',
        actions: [
          { action: 'keep-remind', title: 'Keep reminding me' },
          { action: 'dismiss-cycle', title: "Don't remind this cycle" },
        ],
      }
    } else if (days === 2) {
      payload = {
        title: `⚠️ ${sub.name} renews in 2 days`,
        body: `${amount} will be charged soon.`,
        tag: `stage2-${sub.id}-${sub.nextBillingDate}`,
        stage: 2,
        subId: sub.id,
        renewalDate: sub.nextBillingDate,
        url: '/radar',
        actions: [
          { action: 'keep', title: 'Keep subscription' },
          { action: 'go-cancel', title: 'Cancel it' },
        ],
      }
    } else if (days === 1) {
      payload = {
        title: `\u{1F6A8} Final reminder: ${sub.name} renews TOMORROW`,
        body: `${amount} charges tomorrow. Last chance to cancel.`,
        tag: `stage3-${sub.id}-${sub.nextBillingDate}`,
        stage: 3,
        subId: sub.id,
        renewalDate: sub.nextBillingDate,
        url: '/cancellation',
        actions: [
          { action: 'keep', title: 'Keep it' },
          { action: 'go-cancel', title: 'Cancel now' },
        ],
      }
    }

    if (payload) {
      try {
        await webpush.sendNotification(subscription, JSON.stringify(payload))
        console.log(`Sent stage-${payload.stage} push for ${sub.name} to subscriber`)
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription expired — remove it
          console.log('Removing expired push subscription:', subscription.endpoint)
          delete pushStore[subscription.endpoint]
        } else {
          console.error('Push send error:', err.message)
        }
      }
    }
  }
}

app.post('/api/daily-notify', async (req, res) => {
  // Optional secret to prevent abuse
  const secret = process.env.NOTIFY_SECRET
  if (secret && req.headers['x-notify-secret'] !== secret) {
    return res.status(401).json({ ok: false })
  }

  const entries = Object.values(pushStore)
  console.log(`Running daily notifications for ${entries.length} subscribers...`)

  let sent = 0
  for (const entry of entries) {
    try { await sendPushToSubscriber(entry); sent++ } catch (e) { console.error(e.message) }
  }

  saveStore(pushStore)
  res.json({ ok: true, subscribers: entries.length, processed: sent })
})

// ── Internal Daily Cron (runs at 9 AM server time) ───────────────────────────

function scheduleDaily() {
  const now = new Date()
  const next9AM = new Date()
  next9AM.setHours(9, 0, 0, 0)
  if (next9AM <= now) next9AM.setDate(next9AM.getDate() + 1)
  const msUntil9AM = next9AM - now

  setTimeout(() => {
    runDailyNotifications()
    setInterval(runDailyNotifications, 24 * 60 * 60 * 1000)
  }, msUntil9AM)

  console.log(`Daily notifications scheduled — next run in ${Math.round(msUntil9AM / 60000)} minutes`)
}

async function runDailyNotifications() {
  console.log('Running scheduled daily notifications...')
  const entries = Object.values(pushStore)
  for (const entry of entries) {
    try { await sendPushToSubscriber(entry) } catch {}
  }
  saveStore(pushStore)
}

// ── Gmail ────────────────────────────────────────────────────────────────────

app.get('/auth/google', (req, res) => {
  if (!gmail.isConfigured()) {
    return res.redirect(`${FRONTEND_URL}/scanner?error=gmail_not_configured`)
  }
  res.redirect(gmail.getAuthUrl())
})

app.get('/auth/google/callback', async (req, res) => {
  const { code, error } = req.query
  if (error || !code) return res.redirect(`${FRONTEND_URL}/scanner?error=gmail_denied`)
  try {
    await gmail.handleCallback(code)
    res.redirect(`${FRONTEND_URL}/scanner?connected=gmail`)
  } catch (err) {
    console.error('Gmail callback error:', err.message)
    res.redirect(`${FRONTEND_URL}/scanner?error=gmail_failed`)
  }
})

app.post('/api/scan-gmail', async (req, res) => {
  try {
    const results = await gmail.scanGmail()
    res.json({ ok: true, results })
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message })
  }
})

app.get('/api/gmail-status', (req, res) => res.json(gmail.getStatus()))
app.post('/api/disconnect-gmail', (req, res) => { gmail.disconnect(); res.json({ ok: true }) })

// ── Outlook ──────────────────────────────────────────────────────────────────

app.get('/auth/microsoft', (req, res) => {
  if (!outlook.isConfigured()) {
    return res.redirect(`${FRONTEND_URL}/scanner?error=outlook_not_configured`)
  }
  res.redirect(outlook.getAuthUrl())
})

app.get('/auth/microsoft/callback', async (req, res) => {
  const { code, error } = req.query
  if (error || !code) return res.redirect(`${FRONTEND_URL}/scanner?error=outlook_denied`)
  try {
    await outlook.handleCallback(code)
    res.redirect(`${FRONTEND_URL}/scanner?connected=outlook`)
  } catch (err) {
    console.error('Outlook callback error:', err.message)
    res.redirect(`${FRONTEND_URL}/scanner?error=outlook_failed`)
  }
})

app.post('/api/scan-outlook', async (req, res) => {
  try {
    const results = await outlook.scanOutlook()
    res.json({ ok: true, results })
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message })
  }
})

app.get('/api/outlook-status', (req, res) => res.json(outlook.getStatus()))
app.post('/api/disconnect-outlook', (req, res) => { outlook.disconnect(); res.json({ ok: true }) })

// ── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`SubGuard server running on port ${PORT}`)
  console.log(`Push subscribers loaded: ${Object.keys(pushStore).length}`)
  console.log(`Gmail: ${gmail.isConfigured() ? 'Configured' : 'Not configured'}`)
  console.log(`Outlook: ${outlook.isConfigured() ? 'Configured' : 'Not configured'}`)
  scheduleDaily()
})
