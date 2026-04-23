'use strict'

const KNOWN_SERVICES = [
  'Netflix', 'Hulu', 'Disney+', 'HBO Max', 'Max', 'Amazon Prime', 'Apple TV+',
  'Peacock', 'Paramount+', 'YouTube Premium', 'Crunchyroll', 'ESPN+',
  'Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'Tidal', 'Audible',
  'Adobe Creative Cloud', 'Adobe', 'Microsoft 365', 'Office 365',
  'ChatGPT Plus', 'ChatGPT', 'OpenAI', 'Claude Pro',
  'Grammarly', 'Canva', 'Notion', 'Slack', 'Zoom', 'Figma', 'Dropbox',
  'iCloud+', 'iCloud', 'Google One', 'OneDrive',
  'NordVPN', 'ExpressVPN', 'Surfshark', 'ProtonVPN',
  'LastPass', '1Password', 'Dashlane', 'Bitwarden',
  'Planet Fitness', 'Peloton', 'Apple Fitness+', 'MyFitnessPal', 'Headspace', 'Calm',
  'New York Times', 'Washington Post', 'Wall Street Journal', 'Medium', 'Kindle Unlimited',
  'DoorDash DashPass', 'Uber One', 'HelloFresh', 'Blue Apron', 'Instacart',
  'Amazon Prime Video', 'Prime Video',
  'Xbox Game Pass', 'PlayStation Plus', 'Nintendo Switch Online', 'EA Play',
  'LinkedIn Premium', 'LinkedIn',
  'Duolingo Plus', 'Duolingo', 'Coursera', 'Skillshare', 'MasterClass',
  'BetterHelp', 'Talkspace',
  'Patreon', 'Walmart+',
]

const CATEGORY_MAP = {
  'Streaming': /netflix|hulu|disney|hbo|max|peacock|paramount|espn|apple tv|crunchyroll|youtube premium/i,
  'Music': /spotify|apple music|tidal|pandora|deezer|amazon music|youtube music|audible/i,
  'Software': /adobe|microsoft|office|slack|notion|zoom|figma|grammarly|canva|chatgpt|openai|claude/i,
  'Gaming': /playstation|xbox|steam|nintendo|gaming|game pass|ea play/i,
  'Cloud Storage': /icloud|dropbox|google one|onedrive|cloud storage/i,
  'Fitness': /gym|fitness|peloton|classpass|headspace|calm|noom|strava/i,
  'News/Magazine': /new york times|washington post|wsj|medium|kindle unlimited|audible/i,
  'Food Delivery': /doordash|uber eats|instacart|hellofresh|blue apron/i,
  'Shopping': /amazon prime|walmart\+/i,
}

function detectCategory(text) {
  const lower = text.toLowerCase()
  for (const [cat, pattern] of Object.entries(CATEGORY_MAP)) {
    if (pattern.test(lower)) return cat
  }
  return 'Other'
}

function detectAmount(text) {
  const patterns = [
    /(?:charged?|billed?|payment of|amount[:\s]+|total[:\s]+|price[:\s]+)\$?\s*(\d+(?:[.,]\d{1,2})?)/i,
    /\$\s*(\d+(?:[.,]\d{1,2})?)(?:\s*(?:USD|per month|\/mo|\/month))?/i,
    /(\d+(?:[.,]\d{2}))\s*(?:USD|dollars?)/i,
  ]
  for (const pat of patterns) {
    const m = text.match(pat)
    if (m) {
      const val = parseFloat(m[1].replace(',', '.'))
      if (val > 0 && val < 10000) return val
    }
  }
  return null
}

function detectDate(text) {
  const patterns = [
    /(?:renew(?:s|al)?|next charge|next billing|billed on|expires?|due)\s+(?:on\s+)?([A-Z][a-z]+ \d{1,2},?\s*\d{4})/i,
    /(?:renew(?:s|al)?|next|billing|charge)\s+(?:on\s+)?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /(\d{4}-\d{2}-\d{2})/,
  ]
  for (const pat of patterns) {
    const m = text.match(pat)
    if (m) {
      try {
        const d = new Date(m[1])
        if (!isNaN(d.getTime()) && d > new Date()) {
          return d.toISOString().slice(0, 10)
        }
      } catch {}
    }
  }
  return null
}

function detectBillingCycle(text) {
  if (/\b(annual|yearly|per year|\/year)\b/i.test(text)) return 'Yearly'
  if (/\b(quarter|3[\s-]?month)\b/i.test(text)) return 'Quarterly'
  if (/\b(week(?:ly)?|7[\s-]?day)\b/i.test(text)) return 'Weekly'
  return 'Monthly'
}

function detectServiceName(text) {
  for (const svc of KNOWN_SERVICES) {
    const escaped = svc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (new RegExp(`\\b${escaped}\\b`, 'i').test(text)) return svc
  }
  const m = text.match(/^([A-Z][A-Za-z0-9+ ]{1,25})(?:\s+Invoice|\s+Receipt|\s+Billing)/m)
  if (m) return m[1].trim()
  return null
}

function detectConfidence(result) {
  let score = 0
  if (result.name) score += 2
  if (result.amount) score += 2
  if (result.nextBillingDate) score += 1
  if (result.category && result.category !== 'Other') score += 1
  if (score >= 5) return 'High'
  if (score >= 3) return 'Medium'
  return 'Low'
}

/**
 * Parse email text into a subscription record
 * @param {string} subject - Email subject
 * @param {string} body - Email body text
 * @param {string} sender - From address
 * @returns {object} Parsed subscription data + confidence
 */
function parseEmail(subject, body, sender) {
  const fullText = `${subject}\n${body}`
  const result = {}

  result.name = detectServiceName(fullText)
  if (!result.name && sender) {
    const domain = sender.match(/@([a-zA-Z0-9.-]+)\./)?.[1]
    if (domain) result.name = domain.charAt(0).toUpperCase() + domain.slice(1)
  }

  const amount = detectAmount(fullText)
  if (amount) result.amount = amount

  result.nextBillingDate = detectDate(fullText)
  result.billingCycle = detectBillingCycle(fullText)
  result.category = detectCategory(fullText)

  if (/\b(free trial|trial end|trial expires?)\b/i.test(fullText)) result.isTrial = true
  if (/\b(price (?:increase|change)|new (?:rate|price)|updated? price)\b/i.test(fullText)) result.isPriceIncrease = true

  const pmMatch = fullText.match(/(?:card|visa|mastercard|amex)\s+(?:ending|#)?\s*(\d{4})/i)
  if (pmMatch) result.paymentMethod = `Card ending ${pmMatch[1]}`

  result.confidence = detectConfidence(result)
  result.source = sender || 'Unknown'

  return result
}

module.exports = { parseEmail }
