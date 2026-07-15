'use strict'

const { google } = require('googleapis')
const { parseEmail } = require('./emailParser')

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/userinfo.email']

const SEARCH_QUERIES = [
  'subject:(subscription OR renewal OR receipt OR invoice OR billing OR payment OR charged OR membership)',
  'subject:(trial ending OR trial expires OR price increase)',
  'from:(netflix.com OR spotify.com OR adobe.com OR amazon.com OR apple.com OR google.com OR microsoft.com OR hulu.com OR disneyplus.com)',
]

function getRedirectUri() {
  if (process.env.GMAIL_REDIRECT_URI) return process.env.GMAIL_REDIRECT_URI
  const base = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3001}`
  return `${base}/auth/google/callback`
}

function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    getRedirectUri()
  )
}

// Stateless: tokens live per-user in MongoDB (EmailToken model); every
// function takes the caller's tokens rather than sharing module globals.

function isConfigured() {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here')
}

function getAuthUrl(state) {
  const oauth2Client = createOAuth2Client()
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    state,
  })
}

async function handleCallback(code) {
  const oauth2Client = createOAuth2Client()
  const { tokens } = await oauth2Client.getToken(code)
  oauth2Client.setCredentials(tokens)

  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
  const { data } = await oauth2.userinfo.get()
  return { tokens, email: data.email }
}

async function scanGmail(tokens, since) {
  if (!tokens) throw new Error('Not connected to Gmail')
  const oauth2Client = createOAuth2Client()
  oauth2Client.setCredentials(tokens)
  // googleapis refreshes expired access tokens automatically (via the stored
  // refresh_token); capture the refreshed set so the caller can persist it
  let updatedTokens = null
  oauth2Client.on('tokens', (t) => { updatedTokens = { ...tokens, ...t } })
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

  // Incremental: only mail newer than the last scan; first scan looks back 6 months
  const fallback = new Date()
  fallback.setMonth(fallback.getMonth() - 6)
  const afterDate = Math.floor((since ? new Date(since) : fallback).getTime() / 1000)

  const results = []
  const seenIds = new Set()

  for (const query of SEARCH_QUERIES) {
    try {
      const { data } = await gmail.users.messages.list({
        userId: 'me',
        q: `${query} after:${afterDate}`,
        maxResults: 40,
      })
      if (!data.messages) continue

      for (const msg of data.messages.slice(0, 30)) {
        if (seenIds.has(msg.id)) continue
        seenIds.add(msg.id)

        const { data: full } = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'metadata',
          metadataHeaders: ['Subject', 'From', 'Date'],
        })

        const headers = {}
        full.payload?.headers?.forEach(h => { headers[h.name] = h.value })
        const subject = headers['Subject'] || ''
        const from = headers['From'] || ''
        const date = headers['Date'] || ''
        const snippet = full.snippet || ''

        const parsed = parseEmail(subject, snippet, from)
        // Only surface emails that actually look like an invoice/receipt —
        // a detected amount is the signal; name-only matches are mostly
        // newsletters and promos and just add noise
        if (parsed.amount) {
          results.push({ ...parsed, emailDate: date, subject, from, messageId: msg.id })
        }
      }
    } catch (err) {
      console.error('Gmail query error:', err.message)
    }
  }

  return { results, updatedTokens }
}

module.exports = { isConfigured, getAuthUrl, handleCallback, scanGmail }
