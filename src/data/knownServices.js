// 150+ known subscription services for autocomplete

export const KNOWN_SERVICES = [
  // ── Streaming ──────────────────────────────────────────────────────────────
  { name: 'Netflix', category: 'Streaming', defaultAmount: 15.49 },
  { name: 'Hulu', category: 'Streaming', defaultAmount: 7.99 },
  { name: 'Disney+', category: 'Streaming', defaultAmount: 7.99 },
  { name: 'HBO Max', category: 'Streaming', defaultAmount: 9.99 },
  { name: 'Max', category: 'Streaming', defaultAmount: 9.99 },
  { name: 'Amazon Prime Video', category: 'Streaming', defaultAmount: 8.99 },
  { name: 'Apple TV+', category: 'Streaming', defaultAmount: 9.99 },
  { name: 'Peacock', category: 'Streaming', defaultAmount: 7.99 },
  { name: 'Paramount+', category: 'Streaming', defaultAmount: 7.99 },
  { name: 'YouTube Premium', category: 'Streaming', defaultAmount: 13.99 },
  { name: 'YouTube TV', category: 'Streaming', defaultAmount: 72.99 },
  { name: 'Crunchyroll', category: 'Streaming', defaultAmount: 7.99 },
  { name: 'DAZN', category: 'Streaming', defaultAmount: 19.99 },
  { name: 'Fubo TV', category: 'Streaming', defaultAmount: 79.99 },
  { name: 'Sling TV', category: 'Streaming', defaultAmount: 40.00 },
  { name: 'ESPN+', category: 'Streaming', defaultAmount: 10.99 },
  { name: 'Discovery+', category: 'Streaming', defaultAmount: 4.99 },
  { name: 'BritBox', category: 'Streaming', defaultAmount: 8.99 },
  { name: 'Shudder', category: 'Streaming', defaultAmount: 5.99 },
  { name: 'MUBI', category: 'Streaming', defaultAmount: 10.99 },
  { name: 'Criterion Channel', category: 'Streaming', defaultAmount: 10.99 },
  { name: 'Plex Pass', category: 'Streaming', defaultAmount: 4.99 },

  // ── Music ──────────────────────────────────────────────────────────────────
  { name: 'Spotify', category: 'Music', defaultAmount: 10.99 },
  { name: 'Apple Music', category: 'Music', defaultAmount: 10.99 },
  { name: 'YouTube Music', category: 'Music', defaultAmount: 10.99 },
  { name: 'Amazon Music', category: 'Music', defaultAmount: 8.99 },
  { name: 'Tidal', category: 'Music', defaultAmount: 10.99 },
  { name: 'SoundCloud Go', category: 'Music', defaultAmount: 9.99 },
  { name: 'Pandora', category: 'Music', defaultAmount: 4.99 },
  { name: 'Deezer', category: 'Music', defaultAmount: 10.99 },
  { name: 'Audible', category: 'News/Magazine', defaultAmount: 14.95 },
  { name: 'iHeart Radio', category: 'Music', defaultAmount: 9.99 },
  { name: 'Bandcamp', category: 'Music', defaultAmount: 0 },

  // ── Software / Productivity ────────────────────────────────────────────────
  { name: 'Adobe Creative Cloud', category: 'Software', defaultAmount: 54.99 },
  { name: 'Adobe Photoshop', category: 'Software', defaultAmount: 20.99 },
  { name: 'Adobe Illustrator', category: 'Software', defaultAmount: 20.99 },
  { name: 'Microsoft 365', category: 'Software', defaultAmount: 9.99 },
  { name: 'Microsoft 365 Family', category: 'Software', defaultAmount: 12.99 },
  { name: 'ChatGPT Plus', category: 'Software', defaultAmount: 20.00 },
  { name: 'Claude Pro', category: 'Software', defaultAmount: 20.00 },
  { name: 'Grammarly', category: 'Software', defaultAmount: 12.00 },
  { name: 'Canva Pro', category: 'Software', defaultAmount: 12.99 },
  { name: 'Notion', category: 'Software', defaultAmount: 8.00 },
  { name: 'Evernote', category: 'Software', defaultAmount: 10.83 },
  { name: 'Slack', category: 'Software', defaultAmount: 7.25 },
  { name: 'Zoom', category: 'Software', defaultAmount: 13.33 },
  { name: 'Dropbox', category: 'Software', defaultAmount: 11.99 },
  { name: 'Dropbox Plus', category: 'Software', defaultAmount: 11.99 },
  { name: 'Figma', category: 'Software', defaultAmount: 12.00 },
  { name: 'GitHub Copilot', category: 'Software', defaultAmount: 10.00 },
  { name: 'GitHub Pro', category: 'Software', defaultAmount: 4.00 },
  { name: 'Midjourney', category: 'Software', defaultAmount: 10.00 },
  { name: 'Jasper AI', category: 'Software', defaultAmount: 39.00 },
  { name: 'Trello', category: 'Software', defaultAmount: 5.00 },
  { name: 'Asana', category: 'Software', defaultAmount: 10.99 },
  { name: 'Monday.com', category: 'Software', defaultAmount: 9.00 },
  { name: 'ClickUp', category: 'Software', defaultAmount: 7.00 },
  { name: 'Airtable', category: 'Software', defaultAmount: 10.00 },
  { name: 'Zapier', category: 'Software', defaultAmount: 19.99 },
  { name: 'Loom', category: 'Software', defaultAmount: 8.00 },
  { name: 'Calendly', category: 'Software', defaultAmount: 8.00 },
  { name: 'HubSpot', category: 'Software', defaultAmount: 15.00 },
  { name: 'QuickBooks', category: 'Software', defaultAmount: 30.00 },
  { name: 'FreshBooks', category: 'Software', defaultAmount: 17.00 },
  { name: 'Xero', category: 'Software', defaultAmount: 13.00 },
  { name: 'Webflow', category: 'Software', defaultAmount: 14.00 },
  { name: 'Squarespace', category: 'Software', defaultAmount: 16.00 },
  { name: 'Wix', category: 'Software', defaultAmount: 16.00 },

  // ── Cloud Storage ──────────────────────────────────────────────────────────
  { name: 'Google One', category: 'Cloud Storage', defaultAmount: 2.99 },
  { name: 'iCloud+', category: 'Cloud Storage', defaultAmount: 2.99 },
  { name: 'OneDrive', category: 'Cloud Storage', defaultAmount: 1.99 },
  { name: 'Box', category: 'Cloud Storage', defaultAmount: 10.00 },
  { name: 'pCloud', category: 'Cloud Storage', defaultAmount: 4.99 },

  // ── VPN ────────────────────────────────────────────────────────────────────
  { name: 'NordVPN', category: 'Software', defaultAmount: 4.59 },
  { name: 'ExpressVPN', category: 'Software', defaultAmount: 8.32 },
  { name: 'Surfshark', category: 'Software', defaultAmount: 2.49 },
  { name: 'ProtonVPN', category: 'Software', defaultAmount: 4.99 },
  { name: 'Private Internet Access', category: 'Software', defaultAmount: 2.03 },
  { name: 'Mullvad', category: 'Software', defaultAmount: 5.00 },

  // ── Password Managers ──────────────────────────────────────────────────────
  { name: 'LastPass', category: 'Software', defaultAmount: 3.00 },
  { name: '1Password', category: 'Software', defaultAmount: 2.99 },
  { name: 'Dashlane', category: 'Software', defaultAmount: 4.99 },
  { name: 'Bitwarden', category: 'Software', defaultAmount: 0.83 },
  { name: 'Keeper', category: 'Software', defaultAmount: 2.92 },

  // ── Fitness ────────────────────────────────────────────────────────────────
  { name: 'Planet Fitness', category: 'Fitness', defaultAmount: 24.99 },
  { name: 'Peloton', category: 'Fitness', defaultAmount: 44.00 },
  { name: 'Apple Fitness+', category: 'Fitness', defaultAmount: 9.99 },
  { name: 'MyFitnessPal', category: 'Fitness', defaultAmount: 19.99 },
  { name: 'Headspace', category: 'Fitness', defaultAmount: 12.99 },
  { name: 'Calm', category: 'Fitness', defaultAmount: 14.99 },
  { name: 'Noom', category: 'Fitness', defaultAmount: 59.00 },
  { name: 'ClassPass', category: 'Fitness', defaultAmount: 19.00 },
  { name: 'Strava', category: 'Fitness', defaultAmount: 5.00 },
  { name: 'Fitbit Premium', category: 'Fitness', defaultAmount: 9.99 },
  { name: 'Beachbody on Demand', category: 'Fitness', defaultAmount: 19.99 },
  { name: 'Nike Training Club', category: 'Fitness', defaultAmount: 0 },
  { name: 'Anytime Fitness', category: 'Fitness', defaultAmount: 38.99 },
  { name: 'LA Fitness', category: 'Fitness', defaultAmount: 29.99 },
  { name: 'Gold\'s Gym', category: 'Fitness', defaultAmount: 29.99 },
  { name: 'Bowflex', category: 'Fitness', defaultAmount: 19.99 },

  // ── News & Reading ─────────────────────────────────────────────────────────
  { name: 'New York Times', category: 'News/Magazine', defaultAmount: 4.25 },
  { name: 'Washington Post', category: 'News/Magazine', defaultAmount: 4.00 },
  { name: 'Wall Street Journal', category: 'News/Magazine', defaultAmount: 4.00 },
  { name: 'Medium', category: 'News/Magazine', defaultAmount: 5.00 },
  { name: 'The Athletic', category: 'News/Magazine', defaultAmount: 9.99 },
  { name: 'Kindle Unlimited', category: 'News/Magazine', defaultAmount: 11.99 },
  { name: 'Scribd', category: 'News/Magazine', defaultAmount: 11.99 },
  { name: 'The Economist', category: 'News/Magazine', defaultAmount: 22.00 },
  { name: 'Bloomberg', category: 'News/Magazine', defaultAmount: 34.99 },
  { name: 'Substack', category: 'News/Magazine', defaultAmount: 5.00 },

  // ── Food & Delivery ────────────────────────────────────────────────────────
  { name: 'DoorDash DashPass', category: 'Food Delivery', defaultAmount: 9.99 },
  { name: 'Uber One', category: 'Food Delivery', defaultAmount: 9.99 },
  { name: 'Uber Eats Pass', category: 'Food Delivery', defaultAmount: 9.99 },
  { name: 'HelloFresh', category: 'Food Delivery', defaultAmount: 59.99 },
  { name: 'Blue Apron', category: 'Food Delivery', defaultAmount: 47.95 },
  { name: 'Instacart+', category: 'Food Delivery', defaultAmount: 9.99 },
  { name: 'GrubHub+', category: 'Food Delivery', defaultAmount: 9.99 },
  { name: 'Green Chef', category: 'Food Delivery', defaultAmount: 49.99 },
  { name: 'Sunbasket', category: 'Food Delivery', defaultAmount: 73.99 },

  // ── Shopping ───────────────────────────────────────────────────────────────
  { name: 'Amazon Prime', category: 'Shopping', defaultAmount: 14.99 },
  { name: 'Walmart+', category: 'Shopping', defaultAmount: 12.95 },
  { name: 'Costco', category: 'Shopping', defaultAmount: 6.67 },
  { name: 'Sam\'s Club', category: 'Shopping', defaultAmount: 4.17 },
  { name: 'Stitch Fix', category: 'Shopping', defaultAmount: 20.00 },
  { name: 'FabFitFun', category: 'Shopping', defaultAmount: 49.99 },
  { name: 'Trunk Club', category: 'Shopping', defaultAmount: 25.00 },

  // ── Gaming ─────────────────────────────────────────────────────────────────
  { name: 'Xbox Game Pass', category: 'Gaming', defaultAmount: 14.99 },
  { name: 'Xbox Game Pass Ultimate', category: 'Gaming', defaultAmount: 19.99 },
  { name: 'PlayStation Plus', category: 'Gaming', defaultAmount: 9.99 },
  { name: 'PlayStation Plus Extra', category: 'Gaming', defaultAmount: 14.99 },
  { name: 'Nintendo Switch Online', category: 'Gaming', defaultAmount: 3.99 },
  { name: 'EA Play', category: 'Gaming', defaultAmount: 4.99 },
  { name: 'Humble Bundle', category: 'Gaming', defaultAmount: 12.00 },
  { name: 'GeForce Now', category: 'Gaming', defaultAmount: 9.99 },

  // ── Dating ─────────────────────────────────────────────────────────────────
  { name: 'Tinder Gold', category: 'Other', defaultAmount: 14.99 },
  { name: 'Tinder Platinum', category: 'Other', defaultAmount: 29.99 },
  { name: 'Bumble Boost', category: 'Other', defaultAmount: 16.99 },
  { name: 'Hinge', category: 'Other', defaultAmount: 29.99 },
  { name: 'Match.com', category: 'Other', defaultAmount: 15.99 },
  { name: 'eHarmony', category: 'Other', defaultAmount: 35.90 },

  // ── Education ──────────────────────────────────────────────────────────────
  { name: 'Duolingo Plus', category: 'Other', defaultAmount: 6.99 },
  { name: 'Coursera Plus', category: 'Other', defaultAmount: 49.00 },
  { name: 'Skillshare', category: 'Other', defaultAmount: 13.99 },
  { name: 'MasterClass', category: 'Other', defaultAmount: 10.00 },
  { name: 'LinkedIn Premium', category: 'Other', defaultAmount: 29.99 },
  { name: 'Chegg', category: 'Other', defaultAmount: 14.95 },
  { name: 'Khan Academy', category: 'Other', defaultAmount: 0 },
  { name: 'Babbel', category: 'Other', defaultAmount: 13.95 },
  { name: 'Rosetta Stone', category: 'Other', defaultAmount: 11.99 },
  { name: 'Brilliant', category: 'Other', defaultAmount: 24.99 },
  { name: 'Codecademy', category: 'Other', defaultAmount: 17.49 },

  // ── Health / Therapy ───────────────────────────────────────────────────────
  { name: 'BetterHelp', category: 'Other', defaultAmount: 75.00 },
  { name: 'Talkspace', category: 'Other', defaultAmount: 69.00 },
  { name: 'Teladoc', category: 'Other', defaultAmount: 13.99 },
  { name: 'Nerdio', category: 'Other', defaultAmount: 9.99 },

  // ── Phone / Internet ───────────────────────────────────────────────────────
  { name: 'AT&T', category: 'Phone/Internet', defaultAmount: 0 },
  { name: 'Verizon', category: 'Phone/Internet', defaultAmount: 0 },
  { name: 'T-Mobile', category: 'Phone/Internet', defaultAmount: 0 },
  { name: 'Comcast Xfinity', category: 'Phone/Internet', defaultAmount: 0 },
  { name: 'Spectrum', category: 'Phone/Internet', defaultAmount: 0 },
  { name: 'Google Fi', category: 'Phone/Internet', defaultAmount: 20.00 },
  { name: 'Mint Mobile', category: 'Phone/Internet', defaultAmount: 15.00 },
  { name: 'Visible', category: 'Phone/Internet', defaultAmount: 25.00 },

  // ── Insurance ──────────────────────────────────────────────────────────────
  { name: 'Lemonade', category: 'Insurance', defaultAmount: 0 },
  { name: 'Geico', category: 'Insurance', defaultAmount: 0 },
  { name: 'Progressive', category: 'Insurance', defaultAmount: 0 },
  { name: 'State Farm', category: 'Insurance', defaultAmount: 0 },
  { name: 'Allstate', category: 'Insurance', defaultAmount: 0 },

  // ── Miscellaneous ──────────────────────────────────────────────────────────
  { name: 'Patreon', category: 'Recurring Donation', defaultAmount: 0 },
  { name: 'BarkBox', category: 'Other', defaultAmount: 23.00 },
  { name: 'Dollar Shave Club', category: 'Other', defaultAmount: 5.00 },
  { name: 'Harry\'s', category: 'Other', defaultAmount: 8.00 },
]

export function searchKnownServices(query) {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase()
  return KNOWN_SERVICES
    .filter(s => s.name.toLowerCase().includes(q))
    .sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(q)
      const bStarts = b.name.toLowerCase().startsWith(q)
      if (aStarts && !bStarts) return -1
      if (!aStarts && bStarts) return 1
      return a.name.localeCompare(b.name)
    })
    .slice(0, 6)
}
