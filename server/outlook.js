'use strict'

const { parseEmail } = require('./emailParser')

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0'
const AUTH_BASE = 'https://login.microsoftonline.com/consumers/oauth2/v2.0'
const SCOPES = 'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/User.Read offline_access'

// Stateless: tokens live per-user in MongoDB (EmailToken model); every
// function takes the caller's tokens rather than sharing module globals.

function getRedirectUri() {
  if (process.env.OUTLOOK_REDIRECT_URI) return process.env.OUTLOOK_REDIRECT_URI
  const base = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3001}`
  return `${base}/auth/microsoft/callback`
}

function isConfigured() {
  return !!(
    process.env.MICROSOFT_CLIENT_ID &&
    process.env.MICROSOFT_CLIENT_SECRET &&
    process.env.MICROSOFT_CLIENT_ID !== 'your_microsoft_client_id_here'
  )
}

function getAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID,
    response_type: 'code',
    redirect_uri: getRedirectUri(),
    scope: SCOPES,
    response_mode: 'query',
    state,
  })
  return `${AUTH_BASE}/authorize?${params.toString()}`
}

async function tokenRequest(grant) {
  const fetch = (...args) => import('node-fetch').then(m => m.default(...args))
  const res = await fetch(`${AUTH_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET,
      scope: SCOPES,
      ...grant,
    }),
  })
  const tokens = await res.json()
  if (!tokens.access_token) throw new Error(tokens.error_description || 'Token exchange failed')
  // Track our own expiry so scans know when to refresh (Graph tokens last ~1h)
  tokens.expires_at = Date.now() + (tokens.expires_in || 3600) * 1000
  return tokens
}

async function handleCallback(code) {
  const fetch = (...args) => import('node-fetch').then(m => m.default(...args))
  const tokens = await tokenRequest({
    grant_type: 'authorization_code',
    code,
    redirect_uri: getRedirectUri(),
  })
  const meRes = await fetch(`${GRAPH_BASE}/me`, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const me = await meRes.json()
  return { tokens, email: me.mail || me.userPrincipalName }
}

// Returns a valid token set, refreshing via the refresh_token when the
// access token is expired (or about to be). Callers must persist the result.
async function ensureFreshTokens(tokens) {
  if (tokens.expires_at && tokens.expires_at > Date.now() + 60000) return tokens
  if (!tokens.refresh_token) return tokens // no way to refresh; let the call fail as 401
  const fresh = await tokenRequest({
    grant_type: 'refresh_token',
    refresh_token: tokens.refresh_token,
  })
  // Microsoft may rotate the refresh token; keep the old one if not reissued
  return { ...tokens, ...fresh, refresh_token: fresh.refresh_token || tokens.refresh_token }
}

async function graphGet(tokens, path) {
  const fetch = (...args) => import('node-fetch').then(m => m.default(...args))
  const res = await fetch(`${GRAPH_BASE}${path}`, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  if (!res.ok) throw new Error(`Graph API error: ${res.status}`)
  return res.json()
}

function htmlToText(html) {
  return String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .slice(0, 5000)
}

async function scanOutlook(tokens, since) {
  if (!tokens) throw new Error('Not connected to Outlook')
  const fresh = await ensureFreshTokens(tokens)

  // Graph API limitations: $search cannot be combined with $filter OR
  // $orderby (the request 400s) — results come relevance-ranked, so the
  // date cutoff and sorting both happen client-side below.
  const search = 'subscription OR renewal OR receipt OR billing OR payment OR invoice OR membership'
  const params = new URLSearchParams({
    $search: `"${search}"`,
    $top: '100',
    $select: 'subject,from,receivedDateTime,bodyPreview,body,hasAttachments',
  })

  const data = await graphGet(fresh, `/me/messages?${params.toString()}`)
  const results = []

  // Incremental: only mail newer than the last scan; first scan looks back 6 months
  const fallback = new Date()
  fallback.setMonth(fallback.getMonth() - 6)
  const cutoff = since ? new Date(since) : fallback

  for (const msg of data.value || []) {
    if (msg.receivedDateTime && new Date(msg.receivedDateTime) < cutoff) continue
    const subject = msg.subject || ''
    const from = msg.from?.emailAddress?.address || ''
    // Full body text, not just the 255-char preview — amounts often sit
    // further down (tables, footers) than the preview reaches
    const body = htmlToText(msg.body?.content) || msg.bodyPreview || ''
    const parsed = parseEmail(subject, body, from)
    if (!parsed.name) parsed.name = msg.from?.emailAddress?.name || ''
    // Invoice-like emails (detected amount) always surface; emails with
    // attachments surface too — the invoice may be a PDF we can't read,
    // so let the user decide (marked low confidence, amount left blank)
    if (parsed.amount) {
      results.push({ ...parsed, emailDate: msg.receivedDateTime, subject, from, messageId: msg.id })
    } else if (msg.hasAttachments) {
      results.push({
        ...parsed,
        confidence: 'Low',
        hasAttachment: true,
        emailDate: msg.receivedDateTime, subject, from, messageId: msg.id,
      })
    }
  }

  results.sort((a, b) => new Date(b.emailDate) - new Date(a.emailDate))

  // Hand refreshed tokens back so the caller persists them
  return { results, updatedTokens: fresh !== tokens ? fresh : null }
}

module.exports = { isConfigured, getAuthUrl, handleCallback, scanOutlook }
