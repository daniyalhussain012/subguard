'use strict'

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const gmail = require('./gmail')
const outlook = require('./outlook')

const app = express()
const PORT = process.env.PORT || 3001
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

app.use(cors({ origin: FRONTEND_URL, credentials: true }))
app.use(express.json())

// ── Status ──────────────────────────────────────────────────────────────────

app.get('/api/status', (req, res) => {
  res.json({
    ok: true,
    gmail: gmail.getStatus(),
    outlook: outlook.getStatus(),
  })
})

// ── Gmail ────────────────────────────────────────────────────────────────────

app.get('/auth/google', (req, res) => {
  if (!gmail.isConfigured()) {
    return res.redirect(`${FRONTEND_URL}/scanner?error=gmail_not_configured`)
  }
  res.redirect(gmail.getAuthUrl())
})

app.get('/auth/google/callback', async (req, res) => {
  const { code, error } = req.query
  if (error || !code) {
    return res.redirect(`${FRONTEND_URL}/scanner?error=gmail_denied`)
  }
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

app.get('/api/gmail-status', (req, res) => {
  res.json(gmail.getStatus())
})

app.post('/api/disconnect-gmail', (req, res) => {
  gmail.disconnect()
  res.json({ ok: true })
})

// ── Outlook ──────────────────────────────────────────────────────────────────

app.get('/auth/microsoft', (req, res) => {
  if (!outlook.isConfigured()) {
    return res.redirect(`${FRONTEND_URL}/scanner?error=outlook_not_configured`)
  }
  res.redirect(outlook.getAuthUrl())
})

app.get('/auth/microsoft/callback', async (req, res) => {
  const { code, error } = req.query
  if (error || !code) {
    return res.redirect(`${FRONTEND_URL}/scanner?error=outlook_denied`)
  }
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

app.get('/api/outlook-status', (req, res) => {
  res.json(outlook.getStatus())
})

app.post('/api/disconnect-outlook', (req, res) => {
  outlook.disconnect()
  res.json({ ok: true })
})

// ── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`SubGuard email server running on http://localhost:${PORT}`)
  console.log(`Gmail: ${gmail.isConfigured() ? '✅ Configured' : '⚠️  Not configured (see SETUP_EMAIL.md)'}`)
  console.log(`Outlook: ${outlook.isConfigured() ? '✅ Configured' : '⚠️  Not configured (see SETUP_EMAIL.md)'}`)
})
