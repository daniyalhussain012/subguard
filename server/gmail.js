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

// Stored in-memory (per session) — in production use a DB
let gmailTokens = null
let gmailUserEmail = null

function isConfigured() {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here')
}

function getAuthUrl() {
  const oauth2Client = createOAuth2Client()
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  })
}

async function handleCallback(code) {
  const oauth2Client = createOAuth2Client()
  const { tokens } = await oauth2Client.getToken(code)
  oauth2Client.setCredentials(tokens)
  gmailTokens = tokens

  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
  const { data } = await oauth2.userinfo.get()
  gmailUserEmail = data.email
  return data.email
}

async function scanGmail() {
  if (!gmailTokens) throw new Error('Not connected to Gmail')
  const oauth2Client = createOAuth2Client()
  oauth2Client.setCredentials(gmailTokens)
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const afterDate = Math.floor(sixMonthsAgo.getTime() / 1000)

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
        if (parsed.name || parsed.amount) {
          results.push({ ...parsed, emailDate: date, subject, from, messageId: msg.id })
        }
      }
    } catch (err) {
      console.error('Gmail query error:', err.message)
    }
  }

  return results
}

function disconnect() {
  gmailTokens = null
  gmailUserEmail = null
}

function getStatus() {
  return {
    connected: !!gmailTokens,
    email: gmailUserEmail,
    configured: isConfigured(),
  }
}

module.exports = { isConfigured, getAuthUrl, handleCallback, scanGmail, disconnect, getStatus }
