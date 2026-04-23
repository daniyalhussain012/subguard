// Price database — verified pricing as of early 2025
// matchServiceInDb(name) for fuzzy lookup

const s = (name, aliases, plans, alternatives, category, pricePageUrl) => ({
  name, aliases, plans, alternatives, category, lastUpdated: '2025-01-15', pricePageUrl,
})
const plan = (name, monthlyPrice, yearlyPrice = null, note = '') => ({ name, monthlyPrice, yearlyPrice, note })
const alt = (name, price, type) => ({ name, price, type })

export const PRICE_DB = [
  // ─── STREAMING ──────────────────────────────────────────────────────────
  s('Netflix', ['netflix'],
    [
      plan('Standard with Ads', 6.99),
      plan('Standard', 15.49),
      plan('Premium', 22.99),
    ],
    [
      alt('Hulu', 7.99, 'Similar library'),
      alt('Disney+', 7.99, 'Family-friendly'),
      alt('Amazon Prime Video', 8.99, 'Included with Prime'),
      alt('Tubi', 0, '⭐ Free with ads'),
      alt('Pluto TV', 0, '⭐ Free with ads'),
      alt('Crackle', 0, '⭐ Free with ads'),
      alt('Kanopy', 0, '⭐ Free with library card'),
    ],
    'Streaming', 'https://www.netflix.com/signup/planform'),

  s('Hulu', ['hulu'],
    [
      plan('With Ads', 7.99),
      plan('No Ads', 17.99),
      plan('Live TV + Ads', 76.99),
      plan('Live TV No Ads', 89.99),
    ],
    [
      alt('Netflix', 6.99, 'Standard with Ads'),
      alt('Disney+', 7.99, 'Bundle with Hulu'),
      alt('Peacock', 7.99, 'Similar content'),
      alt('Tubi', 0, '⭐ Free with ads'),
      alt('Pluto TV', 0, '⭐ Free with ads'),
    ],
    'Streaming', 'https://www.hulu.com/account'),

  s('Disney+', ['disney+', 'disney plus', 'disneyplus'],
    [
      plan('Disney+ with Ads', 7.99),
      plan('Disney+ No Ads', 13.99),
      plan('Bundle (Disney+, Hulu, ESPN+) with Ads', 14.99),
      plan('Bundle (Disney+, Hulu, ESPN+) No Ads', 24.99),
    ],
    [
      alt('Netflix', 6.99, 'Standard with Ads'),
      alt('Hulu', 7.99, 'More variety'),
      alt('Tubi', 0, '⭐ Free with ads'),
    ],
    'Streaming', 'https://www.disneyplus.com/subscribe'),

  s('HBO Max', ['hbo max', 'max', 'hbo'],
    [
      plan('With Ads', 9.99),
      plan('Ad-Free', 15.99),
      plan('Ultimate Ad-Free', 19.99),
    ],
    [
      alt('Hulu', 7.99, 'Similar premium content'),
      alt('Netflix', 6.99, 'Standard with Ads'),
      alt('Tubi', 0, '⭐ Free with ads'),
    ],
    'Streaming', 'https://www.max.com/plans'),

  s('Amazon Prime Video', ['amazon prime video', 'prime video', 'amazon video'],
    [
      plan('Prime Video Only', 8.99),
      plan('Amazon Prime (includes video)', 14.99),
      plan('Amazon Prime Annual', 139, 139, 'Billed yearly'),
    ],
    [
      alt('Netflix', 6.99, 'Standard with Ads'),
      alt('Hulu', 7.99, 'With ads'),
      alt('Tubi', 0, '⭐ Free with ads'),
      alt('Freevee', 0, '⭐ Amazon\'s free tier'),
    ],
    'Streaming', 'https://www.amazon.com/gp/video/offers'),

  s('Apple TV+', ['apple tv+', 'apple tv plus', 'apple tv'],
    [
      plan('Apple TV+', 9.99),
      plan('Apple One (Individual)', 19.95, null, 'Includes Music, Arcade, iCloud+'),
      plan('Apple One (Family)', 25.95, null, 'Up to 6 people'),
    ],
    [
      alt('Netflix', 6.99, 'Standard with Ads'),
      alt('Hulu', 7.99, 'More content'),
      alt('Tubi', 0, '⭐ Free with ads'),
    ],
    'Streaming', 'https://tv.apple.com/subscribe'),

  s('Peacock', ['peacock', 'peacocktv'],
    [
      plan('Free', 0),
      plan('Premium', 7.99),
      plan('Premium Plus (No Ads)', 13.99),
    ],
    [
      alt('Hulu', 7.99, 'More content'),
      alt('Pluto TV', 0, '⭐ Free with ads'),
      alt('Tubi', 0, '⭐ Free with ads'),
    ],
    'Streaming', 'https://www.peacocktv.com/plan'),

  s('Paramount+', ['paramount+', 'paramount plus', 'paramount'],
    [
      plan('Essential', 7.99),
      plan('With SHOWTIME', 12.99),
    ],
    [
      alt('Peacock', 7.99, 'Similar content'),
      alt('Hulu', 7.99, 'More variety'),
      alt('Tubi', 0, '⭐ Free with ads'),
    ],
    'Streaming', 'https://www.paramountplus.com/account/'),

  s('YouTube Premium', ['youtube premium', 'youtube'],
    [
      plan('Individual', 13.99),
      plan('Family (up to 6)', 22.99),
      plan('Student', 7.99),
    ],
    [
      alt('YouTube Free', 0, '⭐ Free with ads'),
      alt('Spotify Free', 0, '⭐ Music only, free'),
      alt('uBlock Origin', 0, '⭐ Browser extension blocks ads'),
    ],
    'Streaming', 'https://www.youtube.com/premium'),

  s('Crunchyroll', ['crunchyroll'],
    [
      plan('Fan', 7.99),
      plan('Mega Fan', 9.99),
      plan('Ultimate Fan', 14.99),
    ],
    [
      alt('Funimation', 5.99, 'Anime-focused'),
      alt('HiDive', 4.99, 'Anime library'),
    ],
    'Streaming', 'https://www.crunchyroll.com/premium'),

  // ─── MUSIC ──────────────────────────────────────────────────────────────
  s('Spotify', ['spotify'],
    [
      plan('Free', 0, null, 'Ad-supported, shuffle only'),
      plan('Individual', 10.99),
      plan('Duo', 14.99, null, '2 accounts'),
      plan('Family', 16.99, null, 'Up to 6 accounts'),
      plan('Student', 5.99),
    ],
    [
      alt('Apple Music', 10.99, 'Better audio quality'),
      alt('YouTube Music', 10.99, 'Free with YouTube Premium'),
      alt('Amazon Music', 8.99, 'Free with Prime'),
      alt('Spotify Free', 0, '⭐ Free tier (ads + shuffle)'),
      alt('Pandora', 0, '⭐ Free radio-style'),
      alt('SoundCloud', 0, '⭐ Free tier available'),
    ],
    'Music', 'https://www.spotify.com/us/premium/'),

  s('Apple Music', ['apple music'],
    [
      plan('Individual', 10.99),
      plan('Student', 5.99),
      plan('Family (up to 6)', 16.99),
      plan('Apple One (includes more)', 19.95, null, 'Includes TV+, Arcade, iCloud+'),
    ],
    [
      alt('Spotify', 10.99, 'Larger playlist ecosystem'),
      alt('YouTube Music', 10.99, 'Free with YT Premium'),
      alt('Spotify Free', 0, '⭐ Free with ads'),
      alt('Pandora', 0, '⭐ Free radio'),
    ],
    'Music', 'https://music.apple.com'),

  s('YouTube Music', ['youtube music'],
    [
      plan('Individual', 10.99),
      plan('Family (up to 6)', 16.99),
      plan('Free', 0, null, 'Ad-supported'),
    ],
    [
      alt('Spotify', 10.99, 'Better discovery'),
      alt('Amazon Music', 8.99, 'Cheaper'),
      alt('Spotify Free', 0, '⭐ Free with ads'),
      alt('SoundCloud', 0, '⭐ Free tier'),
    ],
    'Music', 'https://music.youtube.com'),

  s('Amazon Music', ['amazon music', 'amazon music unlimited'],
    [
      plan('Unlimited Individual', 8.99),
      plan('Unlimited Family', 14.99),
      plan('Unlimited with Prime', 7.99, null, 'Discounted for Prime members'),
      plan('Free with Prime', 0, null, 'Limited catalog'),
    ],
    [
      alt('Spotify', 10.99, 'Better playlists'),
      alt('Apple Music', 10.99, 'Better audio quality'),
      alt('Spotify Free', 0, '⭐ Free tier'),
    ],
    'Music', 'https://music.amazon.com/settings'),

  s('Tidal', ['tidal'],
    [
      plan('Individual', 10.99),
      plan('Family (up to 6)', 16.99),
      plan('HiFi (lossless audio)', 19.99),
    ],
    [
      alt('Spotify', 10.99, 'Similar price'),
      alt('Apple Music', 10.99, 'Lossless included'),
      alt('Spotify Free', 0, '⭐ Free tier'),
    ],
    'Music', 'https://tidal.com/subscribe'),

  // ─── SOFTWARE ───────────────────────────────────────────────────────────
  s('Adobe Creative Cloud', ['adobe creative cloud', 'adobe cc', 'adobe'],
    [
      plan('Photography Plan (Ps + Lr)', 9.99),
      plan('Single App', 20.99, null, 'Any one app'),
      plan('All Apps', 54.99),
    ],
    [
      alt('Affinity Photo', 69.99, 'One-time purchase (no sub)'),
      alt('Photopea', 0, '⭐ Free Photoshop alternative (browser)'),
      alt('GIMP', 0, '⭐ Free Photoshop alternative (desktop)'),
      alt('DaVinci Resolve', 0, '⭐ Free video editor'),
      alt('Canva', 12.99, 'Simpler design tool'),
      alt('Figma', 0, '⭐ Free for individuals'),
    ],
    'Software', 'https://www.adobe.com/creativecloud/plans.html'),

  s('Microsoft 365', ['microsoft 365', 'microsoft office', 'office 365', 'ms365'],
    [
      plan('Personal (1 device)', 6.99),
      plan('Family (up to 6)', 9.99),
    ],
    [
      alt('Google Workspace Personal', 6, 'Docs, Sheets, Drive'),
      alt('LibreOffice', 0, '⭐ Free Office alternative (desktop)'),
      alt('Google Docs', 0, '⭐ Free online docs/sheets'),
      alt('OnlyOffice', 0, '⭐ Free Office-compatible suite'),
    ],
    'Software', 'https://www.microsoft.com/en-us/microsoft-365/buy/compare-all-microsoft-365-products'),

  s('ChatGPT Plus', ['chatgpt plus', 'chatgpt', 'openai'],
    [
      plan('Free', 0, null, 'GPT-4o mini, limited'),
      plan('Plus', 20),
      plan('Pro', 200, null, 'Unlimited o1, advanced reasoning'),
    ],
    [
      alt('Claude.ai (Anthropic)', 20, 'Strong coding and writing'),
      alt('Gemini Advanced', 19.99, 'Google integration'),
      alt('Copilot', 20, 'Microsoft 365 integration'),
      alt('Perplexity Pro', 20, 'Search-focused AI'),
      alt('Claude Free', 0, '⭐ Free tier available'),
    ],
    'Software', 'https://chat.openai.com/subscription'),

  s('Grammarly', ['grammarly'],
    [
      plan('Free', 0, null, 'Basic grammar only'),
      plan('Premium', 12, 30, 'Monthly billed or $12/mo annual'),
      plan('Business (per seat)', 15),
    ],
    [
      alt('LanguageTool', 0, '⭐ Free grammar checker'),
      alt('Hemingway Editor', 0, '⭐ Free style checker'),
      alt('ProWritingAid', 7, 'Cheaper alternative'),
      alt('Google Docs grammar check', 0, '⭐ Built-in, free'),
    ],
    'Software', 'https://www.grammarly.com/upgrade'),

  s('Canva', ['canva'],
    [
      plan('Free', 0, null, 'Large free tier'),
      plan('Canva Pro', 12.99, 9.99, '$119.99/yr'),
      plan('Canva Teams (per user)', 14.99),
    ],
    [
      alt('Canva Free', 0, '⭐ Same app, great free tier'),
      alt('Figma', 0, '⭐ Free for individuals'),
      alt('Adobe Express', 0, '⭐ Free tier'),
      alt('Crello/Visme', 0, '⭐ Free tiers available'),
    ],
    'Software', 'https://www.canva.com/pricing/'),

  s('Notion', ['notion'],
    [
      plan('Free', 0, null, 'Unlimited pages for individuals'),
      plan('Plus', 8, 6, '$96/yr billed annually'),
      plan('Business', 15, 12),
      plan('AI add-on', 8, null, 'Added to any plan'),
    ],
    [
      alt('Notion Free', 0, '⭐ Generous free tier'),
      alt('Obsidian', 0, '⭐ Free local notes'),
      alt('Logseq', 0, '⭐ Free outliner'),
      alt('Capacities', 0, '⭐ Free personal knowledge base'),
    ],
    'Software', 'https://www.notion.so/pricing'),

  // ─── CLOUD STORAGE ──────────────────────────────────────────────────────
  s('iCloud+', ['icloud+', 'icloud'],
    [
      plan('50 GB', 0.99),
      plan('200 GB', 2.99),
      plan('2 TB', 9.99),
      plan('6 TB', 29.99),
      plan('12 TB', 59.99),
    ],
    [
      alt('Google One 100 GB', 1.99, 'Cross-platform'),
      alt('OneDrive 100 GB', 1.99, 'Windows integration'),
      alt('Google Drive 15 GB', 0, '⭐ Free 15 GB from Google'),
      alt('Proton Drive 1 GB', 0, '⭐ Free encrypted storage'),
    ],
    'Cloud Storage', 'https://support.apple.com/en-us/HT201238'),

  s('Google One', ['google one', 'google drive', 'google storage'],
    [
      plan('100 GB', 1.99),
      plan('200 GB', 2.99),
      plan('2 TB', 9.99),
      plan('5 TB', 24.99),
    ],
    [
      alt('iCloud+ 50 GB', 0.99, 'Apple ecosystem'),
      alt('OneDrive 100 GB', 1.99, 'Microsoft integration'),
      alt('Google Drive 15 GB', 0, '⭐ Free 15 GB included'),
      alt('Mega 20 GB', 0, '⭐ Free 20 GB encrypted'),
    ],
    'Cloud Storage', 'https://one.google.com/about/plans'),

  s('Dropbox', ['dropbox'],
    [
      plan('Free', 0, null, '2 GB only'),
      plan('Plus (2 TB)', 11.99, 9.99, '$119.99/yr'),
      plan('Professional (3 TB)', 19.99, 16.58),
    ],
    [
      alt('Google One 100 GB', 1.99, 'Much cheaper'),
      alt('OneDrive 1 TB with M365', 6.99, 'Includes Office apps'),
      alt('iCloud+ 200 GB', 2.99, 'Apple ecosystem'),
      alt('Mega 20 GB', 0, '⭐ Free 20 GB'),
      alt('pCloud', 0, '⭐ Freemium option'),
    ],
    'Cloud Storage', 'https://www.dropbox.com/plans'),

  s('OneDrive', ['onedrive', 'microsoft onedrive'],
    [
      plan('Free (5 GB)', 0),
      plan('100 GB', 1.99),
      plan('1 TB with Microsoft 365', 6.99),
    ],
    [
      alt('Google One 100 GB', 1.99, 'Similar price'),
      alt('iCloud+ 50 GB', 0.99, 'Cheaper for Apple users'),
      alt('Mega 20 GB', 0, '⭐ Free 20 GB'),
    ],
    'Cloud Storage', 'https://www.microsoft.com/en-us/microsoft-365/onedrive/compare-onedrive-plans'),

  // ─── VPN ────────────────────────────────────────────────────────────────
  s('NordVPN', ['nordvpn', 'nord vpn'],
    [
      plan('Basic (monthly)', 12.99),
      plan('Basic (1-year)', null, 59.88, '$4.99/mo billed annually'),
      plan('Basic (2-year)', null, 74.16, '$3.09/mo billed 2 years'),
      plan('Plus (includes Password Manager)', null, 83.88, '$6.99/mo annual'),
    ],
    [
      alt('Surfshark', 2.49, 'Cheapest 2-year plan'),
      alt('Mullvad', 5, 'Privacy-first, no logs'),
      alt('ProtonVPN', 0, '⭐ Free tier (1 device, slower)'),
      alt('Windscribe', 0, '⭐ Free 10 GB/mo'),
    ],
    'Software', 'https://nordvpn.com/pricing/'),

  s('ExpressVPN', ['expressvpn', 'express vpn'],
    [
      plan('Monthly', 12.95),
      plan('6-month', null, 59.95, '$9.99/mo'),
      plan('Annual', null, 99.95, '$8.32/mo'),
    ],
    [
      alt('NordVPN', 4.99, 'Annual plan, similar quality'),
      alt('Surfshark', 2.49, 'Cheapest, unlimited devices'),
      alt('ProtonVPN', 0, '⭐ Free tier available'),
    ],
    'Software', 'https://www.expressvpn.com/vpn-software/vpn-pricing'),

  s('Surfshark', ['surfshark'],
    [
      plan('Starter (monthly)', 15.45),
      plan('Starter (1-year)', null, 41.88, '$3.99/mo'),
      plan('Starter (2-year)', null, 59.76, '$2.49/mo billed 2 years'),
      plan('One (includes antivirus)', null, 71.76, '$2.99/mo 2-year'),
    ],
    [
      alt('NordVPN', 3.09, 'Slightly more trusted'),
      alt('ProtonVPN', 0, '⭐ Free tier (limited)'),
      alt('Windscribe', 0, '⭐ Free 10 GB/mo'),
    ],
    'Software', 'https://surfshark.com/vpn-pricing'),

  // ─── FITNESS ────────────────────────────────────────────────────────────
  s('Planet Fitness', ['planet fitness'],
    [
      plan('Classic', 10),
      plan('PF Black Card', 24.99, null, 'Guest privileges, all clubs'),
    ],
    [
      alt('Apple Fitness+', 9.99, 'Home workouts'),
      alt('Nike Training Club', 0, '⭐ Free guided workouts'),
      alt('YouTube Fitness', 0, '⭐ Free workout videos'),
      alt('Peloton App Only', 12.99, 'Structured programs'),
    ],
    'Fitness', 'https://www.planetfitness.com/gyms'),

  s('Peloton', ['peloton'],
    [
      plan('App (no equipment)', 12.99),
      plan('App+ (all content)', 24, null, '$24/mo for app only'),
      plan('All-Access (equipment owners)', 44),
    ],
    [
      alt('Apple Fitness+', 9.99, 'Similar structured content'),
      alt('Beachbody on Demand', 2.99, 'Cheaper'),
      alt('Nike Training Club', 0, '⭐ Free'),
      alt('YouTube Fitness', 0, '⭐ Free'),
    ],
    'Fitness', 'https://www.onepeloton.com/app'),

  s('Apple Fitness+', ['apple fitness+', 'apple fitness plus'],
    [
      plan('Individual', 9.99),
      plan('Family (up to 6)', 9.99, null, 'Same price for whole family'),
      plan('Apple One Premier (includes)', 37.95),
    ],
    [
      alt('Nike Training Club', 0, '⭐ Free on iOS'),
      alt('YouTube Fitness', 0, '⭐ Free workouts'),
      alt('Peloton App', 12.99, 'More structured'),
    ],
    'Fitness', 'https://www.apple.com/apple-fitness-plus/'),

  // ─── PASSWORD MANAGERS ──────────────────────────────────────────────────
  s('LastPass', ['lastpass'],
    [
      plan('Free (1 device type)', 0),
      plan('Premium', 3, null, '$36/yr'),
      plan('Families (up to 6)', 4, null, '$48/yr'),
    ],
    [
      alt('Bitwarden', 0, '⭐ Free, open-source, excellent'),
      alt('1Password', 2.99, 'More polished UX'),
      alt('Apple Keychain', 0, '⭐ Free for Apple ecosystem'),
      alt('Google Password Manager', 0, '⭐ Free cross-platform'),
    ],
    'Software', 'https://www.lastpass.com/pricing'),

  s('1Password', ['1password', '1 password'],
    [
      plan('Individual', 2.99, null, '$35.88/yr'),
      plan('Families (up to 5)', 4.99, null, '$59.88/yr'),
      plan('Teams Starter (5 users)', 19.95),
    ],
    [
      alt('Bitwarden', 0, '⭐ Free, open-source'),
      alt('Apple Keychain', 0, '⭐ Free for Apple users'),
      alt('Dashlane', 3.33, 'Feature-rich'),
    ],
    'Software', 'https://1password.com/sign-up/'),

  // ─── NEWS / MEDIA ────────────────────────────────────────────────────────
  s('New York Times', ['new york times', 'nytimes', 'nyt'],
    [
      plan('Basic Digital', 4, null, 'Introductory rate'),
      plan('All Access', 17, null, 'Regular rate'),
      plan('Games + Cooking bundle', 25, null, 'All features'),
    ],
    [
      alt('The Guardian', 0, '⭐ Free (reader-supported)'),
      alt('AP News', 0, '⭐ Free'),
      alt('Reuters', 0, '⭐ Free'),
      alt('Google News', 0, '⭐ Aggregates free articles'),
      alt('Apple News+', 12.99, 'Many publications bundled'),
    ],
    'News/Magazine', 'https://www.nytimes.com/subscription'),

  s('Washington Post', ['washington post', 'wapo', 'washingtonpost'],
    [
      plan('Digital (intro)', 4, null, 'Introductory rate'),
      plan('Digital (regular)', 9.99),
      plan('Print + Digital', 19.99),
    ],
    [
      alt('The Guardian', 0, '⭐ Free'),
      alt('AP News', 0, '⭐ Free'),
      alt('Politico', 0, '⭐ Free news'),
      alt('Apple News+', 12.99, 'Bundle'),
    ],
    'News/Magazine', 'https://subscribe.washingtonpost.com'),

  s('Wall Street Journal', ['wall street journal', 'wsj'],
    [
      plan('Digital (intro)', 4),
      plan('Digital (regular)', 12),
      plan('Print + Digital', 19.99),
    ],
    [
      alt('Reuters', 0, '⭐ Free financial news'),
      alt('Bloomberg (limited)', 0, '⭐ Some free articles'),
      alt('MarketWatch', 0, '⭐ Free financial news'),
      alt('Apple News+', 12.99, 'Bundle deal'),
    ],
    'News/Magazine', 'https://subscribe.wsj.com'),

  s('Medium', ['medium'],
    [
      plan('Free (3 articles/mo)', 0),
      plan('Member', 5, 4.17, '$50/yr'),
    ],
    [
      alt('Substack', 0, '⭐ Free newsletter platform'),
      alt('Dev.to', 0, '⭐ Free tech articles'),
      alt('Hashnode', 0, '⭐ Free tech blogging'),
    ],
    'News/Magazine', 'https://medium.com/plans'),

  s('Audible', ['audible'],
    [
      plan('Audible Plus', 7.95),
      plan('Audible Premium Plus', 14.95, null, 'Plus 1 credit/mo'),
      plan('Premium Plus 2 credits', 22.95),
    ],
    [
      alt('Libby / OverDrive', 0, '⭐ Free audiobooks via library'),
      alt('Spotify audiobooks', 0, '⭐ Some included with Premium'),
      alt('Scribd', 11.99, 'Unlimited books + audiobooks'),
      alt('Hoopla', 0, '⭐ Free via library card'),
    ],
    'News/Magazine', 'https://www.audible.com/ep/member-benefits'),

  s('Kindle Unlimited', ['kindle unlimited', 'kindle'],
    [
      plan('Kindle Unlimited', 11.99),
    ],
    [
      alt('Libby / OverDrive', 0, '⭐ Free ebooks via library'),
      alt('Hoopla', 0, '⭐ Free via library'),
      alt('Project Gutenberg', 0, '⭐ 60,000 free classics'),
      alt('Scribd', 11.99, 'Also includes audiobooks'),
    ],
    'News/Magazine', 'https://www.amazon.com/kindle-dbs/hz/subscribe/ku'),

  // ─── GAMING ─────────────────────────────────────────────────────────────
  s('Xbox Game Pass', ['xbox game pass', 'xbox', 'game pass', 'microsoft game pass'],
    [
      plan('PC Game Pass', 9.99),
      plan('Core (online multiplayer)', 9.99),
      plan('Game Pass Standard', 14.99, null, 'No day-one releases'),
      plan('Game Pass Ultimate', 19.99, null, 'PC + Console + EA Play + cloud'),
    ],
    [
      alt('PlayStation Plus Essential', 9.99, 'PS exclusive games'),
      alt('EA Play', 4.99, 'EA titles only, cheaper'),
      alt('Epic Games Store', 0, '⭐ Free games weekly'),
    ],
    'Gaming', 'https://www.xbox.com/en-US/xbox-game-pass'),

  s('PlayStation Plus', ['playstation plus', 'ps plus', 'psn plus', 'playstation'],
    [
      plan('Essential', 9.99, 7.99, '$79.99/yr'),
      plan('Extra', 14.99, 12.49, '$149.99/yr'),
      plan('Premium', 17.99, 14.99, '$179.99/yr'),
    ],
    [
      alt('Xbox Game Pass Ultimate', 19.99, 'Better value for PC gamers'),
      alt('EA Play', 4.99, 'EA titles only'),
      alt('Epic Games Store', 0, '⭐ Free games weekly'),
    ],
    'Gaming', 'https://www.playstation.com/en-us/ps-plus/'),

  s('Nintendo Switch Online', ['nintendo switch online', 'nintendo online', 'nintendo'],
    [
      plan('Individual (monthly)', 3.99),
      plan('Individual (annual)', null, 19.99, '$1.67/mo'),
      plan('Family (up to 8)', null, 34.99, 'Annual'),
      plan('Expansion Pack Individual', null, 49.99, 'Annual, retro games'),
      plan('Expansion Pack Family', null, 79.99, 'Annual'),
    ],
    [
      alt('No real equivalent', 0, '⭐ Required for online play'),
    ],
    'Gaming', 'https://www.nintendo.com/switch/online/'),

  s('EA Play', ['ea play', 'ea access', 'ea'],
    [
      plan('EA Play', 4.99, 2.99, '$29.99/yr'),
      plan('EA Play Pro (PC only)', 14.99, 9.99, '$119.99/yr'),
    ],
    [
      alt('Xbox Game Pass Ultimate', 19.99, 'Includes EA Play + much more'),
      alt('Epic Games Store', 0, '⭐ Free games weekly'),
    ],
    'Gaming', 'https://www.ea.com/ea-play'),

  // ─── FOOD / DELIVERY ────────────────────────────────────────────────────
  s('DoorDash DashPass', ['doordash dashpass', 'dashpass', 'doordash'],
    [
      plan('DashPass Monthly', 9.99),
      plan('DashPass Annual', null, 99, '$8.25/mo'),
    ],
    [
      alt('Uber One', 9.99, 'Similar delivery membership'),
      alt('No membership', 0, '⭐ Pay fees per order'),
    ],
    'Food Delivery', 'https://www.doordash.com/dashpass/'),

  s('Uber One', ['uber one', 'uber eats pass'],
    [
      plan('Monthly', 9.99),
      plan('Annual', null, 99.99, '$8.33/mo'),
    ],
    [
      alt('DoorDash DashPass', 9.99, 'Similar savings'),
      alt('No membership', 0, '⭐ Pay per order'),
    ],
    'Food Delivery', 'https://www.uber.com/us/en/u/uber-one/'),

  s('HelloFresh', ['hellofresh', 'hello fresh'],
    [
      plan('2-person, 3 meals/wk', 9.99, null, 'per serving, varies'),
      plan('4-person, 4 meals/wk', 8.99, null, 'per serving'),
    ],
    [
      alt('EveryPlate', 4.99, 'Budget meal kit from HelloFresh parent'),
      alt('Dinnerly', 5, 'Cheapest meal kit'),
      alt('Grocery store', 0, '⭐ Cook your own meals'),
    ],
    'Food Delivery', 'https://www.hellofresh.com/plans'),

  // ─── SHOPPING ───────────────────────────────────────────────────────────
  s('Amazon Prime', ['amazon prime', 'prime'],
    [
      plan('Monthly', 14.99),
      plan('Annual', null, 139, '$11.58/mo'),
      plan('Student (annual)', null, 69, 'Prime with .edu email'),
    ],
    [
      alt('Walmart+', 12.95, 'Similar delivery perks'),
      alt('No membership', 0, '⭐ Free shipping threshold on Amazon'),
    ],
    'Shopping', 'https://www.amazon.com/prime'),

  s('Walmart+', ['walmart+', 'walmart plus'],
    [
      plan('Monthly', 12.95),
      plan('Annual', null, 98, '$8.17/mo'),
    ],
    [
      alt('Amazon Prime', 14.99, 'More streaming content'),
      alt('No membership', 0, '⭐ Pay delivery fees per order'),
    ],
    'Shopping', 'https://www.walmart.com/plus'),

  // ─── OTHER ──────────────────────────────────────────────────────────────
  s('LinkedIn Premium', ['linkedin premium', 'linkedin'],
    [
      plan('Career', 29.99, 19.99, '$239.88/yr'),
      plan('Business', 59.99),
      plan('Sales Navigator', 99.99),
    ],
    [
      alt('LinkedIn Free', 0, '⭐ Basic networking for free'),
      alt('Indeed', 0, '⭐ Free job search'),
      alt('Glassdoor', 0, '⭐ Free company research'),
    ],
    'Membership', 'https://premium.linkedin.com'),

  s('Duolingo Plus', ['duolingo plus', 'duolingo super', 'duolingo'],
    [
      plan('Free', 0, null, 'With ads and limited hearts'),
      plan('Super Duolingo', 6.99, 4.17, '$49.99/yr'),
      plan('Duolingo Max', 13.99, 9.17, '$109.99/yr'),
    ],
    [
      alt('Duolingo Free', 0, '⭐ Same core learning, ads'),
      alt('Babbel', 6.95, 'More structured lessons'),
      alt('Language Transfer', 0, '⭐ Free audio courses'),
    ],
    'Software', 'https://www.duolingo.com/store'),

  s('Headspace', ['headspace'],
    [
      plan('Monthly', 12.99),
      plan('Annual', null, 69.99, '$5.83/mo'),
      plan('Family (up to 6)', null, 99.99),
    ],
    [
      alt('Calm', 6.25, 'Annual plan comparable'),
      alt('Insight Timer', 0, '⭐ Free meditation app'),
      alt('YouTube meditation', 0, '⭐ Free guided sessions'),
    ],
    'Fitness', 'https://www.headspace.com/subscriptions'),

  s('Calm', ['calm'],
    [
      plan('Monthly', 14.99),
      plan('Annual', null, 69.99, '$5.83/mo'),
      plan('Lifetime', null, 399.99, 'One-time purchase'),
    ],
    [
      alt('Headspace', 5.83, 'Annual plan similar'),
      alt('Insight Timer', 0, '⭐ Free meditation app'),
      alt('YouTube meditation', 0, '⭐ Free'),
    ],
    'Fitness', 'https://www.calm.com/pricing'),

  s('Patreon', ['patreon'],
    [
      plan('Creator support (varies)', 1, null, 'Per creator you support'),
    ],
    [
      alt('Buy Me a Coffee', 0, '⭐ One-time tips'),
      alt('Substack', 0, '⭐ Newsletter subscriptions'),
    ],
    'Recurring Donation', 'https://www.patreon.com/explore'),
]

// ─── Helpers ──────────────────────────────────────────────────────────────

export function findServiceInDb(subName) {
  if (!subName) return null
  const norm = subName.toLowerCase().trim()
  // Exact name match
  let match = PRICE_DB.find(s => s.name.toLowerCase() === norm)
  if (match) return match
  // Alias match
  match = PRICE_DB.find(s => s.aliases.some(a => norm === a || norm.includes(a) || a.includes(norm)))
  if (match) return match
  // Service name in sub name or vice versa
  match = PRICE_DB.find(s => norm.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(norm))
  return match || null
}

export function detectCurrentPlan(dbEntry, amount) {
  if (!dbEntry?.plans || !amount) return null
  return dbEntry.plans.reduce((best, plan) => {
    const diff = Math.abs(plan.monthlyPrice - amount)
    const bestDiff = best ? Math.abs(best.monthlyPrice - amount) : Infinity
    return diff < bestDiff ? plan : best
  }, null)
}

export function getCheaperPlans(dbEntry, currentPlan) {
  if (!dbEntry?.plans || !currentPlan) return []
  return dbEntry.plans.filter(p => p.monthlyPrice < currentPlan.monthlyPrice && p.monthlyPrice > 0)
}

export function getFreeAlternatives(dbEntry) {
  return dbEntry?.alternatives?.filter(a => a.price === 0) || []
}

export function getPaidAlternatives(dbEntry) {
  return dbEntry?.alternatives?.filter(a => a.price > 0) || []
}
