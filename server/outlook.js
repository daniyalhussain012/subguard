'use strict'

const { parseEmail } = require('./emailParser')

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0'
const AUTH_BASE = 'https://login.microsoftonline.com/consumers/oauth2/v2.0'
const SCOPES = 'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/User.Read offline_access'

let outlookTokens = null
let outlookUserEmail = null

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

function getAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID,
    response_type: 'code',
    redirect_uri: getRedirectUri(),
    scope: SCOPES,
    response_mode: 'query',
  })
  return `${AUTH_BASE}/authorize?${params.toString()}`
}

async function handleCallback(code) {
  const fetch = (...args) => import('node-fetch').then(m => m.default(...args))
  const res = await fetch(`${AUTH_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET,
      redirect_uri: getRedirectUri(),
      grant_type: 'authorization_code',
      code,
      scope: SCOPES,
    }),
  })
  const tokens = await res.json()
  if (!tokens.access_token) throw new Error(tokens.error_description || 'Token exchange failed')
  outlookTokens = tokens

  const meRes = await fetch(`${GRAPH_BASE}/me`, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const me = await meRes.json()
  outlookUserEmail = me.mail || me.userPrincipalName
  return outlookUserEmail
}

async function graphGet(path) {
  const fetch = (...args) => import('node-fetch').then(m => m.default(...args))
  if (!outlookTokens) throw new Error('Not connected to Outlook')
  const res = await fetch(`${GRAPH_BASE}${path}`, {
    headers: { Authorization: `Bearer ${outlookTokens.access_token}` },
  })
  if (!res.ok) throw new Error(`Graph API error: ${res.status}`)
  return res.json()
}

async function scanOutlook() {
  if (!outlookTokens) throw new Error('Not connected to Outlook')

  // Note: $search and $filter cannot be combined in Graph API
  const search = 'subscription OR renewal OR receipt OR billing OR payment OR invoice OR membership'
  const params = new URLSearchParams({
    $search: `"${search}"`,
    $top: '100',
    $select: 'subject,from,receivedDateTime,bodyPreview',
    $orderby: 'receivedDateTime desc',
  })

  const data = await graphGet(`/me/messages?${params.toString()}`)
  const results = []

  for (const msg of data.value || []) {
    const subject = msg.subject || ''
    const from = msg.from?.emailAddress?.address || ''
    const body = msg.bodyPreview || ''
    const parsed = parseEmail(subject, body, from)
    if (parsed.name || parsed.amount) {
      results.push({ ...parsed, emailDate: msg.receivedDateTime, subject, from, messageId: msg.id })
    }
  }

  return results
}

function disconnect() { outlookTokens = null; outlookUserEmail = null }

function getStatus() {
  return { connected: !!outlookTokens, email: outlookUserEmail, configured: isConfigured() }
}

module.exports = { isConfigured, getAuthUrl, handleCallback, scanOutlook, disconnect, getStatus }
