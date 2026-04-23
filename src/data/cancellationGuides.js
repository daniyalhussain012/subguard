// 76-service cancellation guide database

const g = (name, aliases, url, diff, time, steps, warnings = [], tips = [], retention = [], refund = 'No refunds — access continues until end of billing period', dataExp = 'Check account settings for a data export or download option.', lastVerified = '2025-01-15') => ({
  name, searchAliases: aliases, url, difficulty: diff, estimatedTime: time,
  steps, warnings, tips, retentionTactics: retention, refundPolicy: refund, dataExport: dataExp, lastVerified,
})

export const CANCELLATION_GUIDES = [

  // ── STREAMING ─────────────────────────────────────────────────────────────

  g('Netflix', ['netflix'], 'https://www.netflix.com/cancelplan', 'Easy', '2 min',
    ['Go to netflix.com and sign in', 'Click your profile icon in the top-right corner', 'Select "Account" from the dropdown', 'Scroll to "Membership & Billing" and click "Cancel Membership"', 'Click "Finish Cancellation" — you keep access until the billing period ends'],
    ['No refunds — you keep access until the period ends', 'Downloaded content is deleted when membership ends'],
    ['Consider the $6.99/mo Standard with Ads plan before fully cancelling', 'Your profiles and watch history are saved for 10 months if you return', 'You can pause up to 3 months instead of cancelling'],
    ['"Your history and profiles will still be there when you return"', 'May offer 1 free month to stay', 'May show upcoming releases to tempt you'],
    'No refunds — access continues until billing period ends',
    'Account → Profile → Get copy of your data → submit request for viewing history'),

  g('Hulu', ['hulu'], 'https://secure.hulu.com/account/cancel', 'Easy', '2 min',
    ['Log in at hulu.com', 'Click your name/profile icon → Account', 'Under "Your Subscription", click "Cancel"', 'Click through the confirmation screens', 'Confirm cancellation on the final screen'],
    ['If you subscribed via Apple or Roku, you must cancel through them — Hulu\'s site won\'t work', 'Live TV plans have different cancellation rules'],
    ['Hulu with Ads is only $7.99/mo — consider downgrading instead', 'Disney Bundle includes Hulu for about the same price as Hulu alone'],
    ['May offer a discounted plan to stay', '"Your watchlist will be waiting for you when you return"'],
    'No refunds on partial months',
    'Hulu does not offer a personal data export'),

  g('Disney+', ['disney+', 'disney plus', 'disneyplus'], 'https://www.disneyplus.com/account/subscription', 'Easy', '2 min',
    ['Sign in at disneyplus.com', 'Click your profile icon in the top-right', 'Select "Account"', 'Under Subscription, click "Cancel Subscription"', 'Review the cancellation terms and confirm'],
    ['If subscribed through Apple, Google Play, or Amazon, cancel through those stores'],
    ['Disney+ with Ads is only $7.99/mo — may be worth keeping', 'The Disney+/Hulu/ESPN+ bundle can be better value than Disney+ alone'],
    ['"Your favorites and continue watching will be saved"', 'May highlight upcoming Marvel/Star Wars content'],
    'No refunds — access continues to billing period end',
    'Disney+ does not provide a personal data export'),

  g('HBO Max', ['hbo max', 'max', 'hbo'], 'https://www.max.com/settings/account', 'Easy', '2 min',
    ['Sign in at max.com', 'Click your profile icon → Settings', 'Select "Subscription"', 'Click "Cancel Subscription"', 'Confirm on the next screen'],
    ['If you subscribed through Amazon Channels, Apple, or Roku, cancel through those services instead', 'HBO Max has been renamed to "Max" — same cancellation process'],
    ['Max with Ads at $9.99/mo saves $6/mo over Ad-Free', 'Check if your internet provider includes Max for free'],
    ['"You have X days left — enjoy them!"', 'May offer a pause option'],
    'No refunds for unused time',
    'Max does not offer personal data downloads'),

  g('Amazon Prime Video', ['amazon prime video', 'prime video'], 'https://www.amazon.com/gp/primecentral', 'Medium', '3 min',
    ['Go to amazon.com and sign in', 'Hover over "Account & Lists" → click "Prime Membership"', 'Click "Manage Membership" on the left side', 'Click "End Membership"', 'Amazon shows a screen of everything you\'ll lose — click "Continue to Cancel"', 'Choose whether to cancel now or at period end and confirm'],
    ['Amazon shows 6+ screens trying to stop you — stay focused', 'Cancelling Prime cancels all Prime benefits (free shipping, Prime Music, etc.) not just video', 'If you want video only, subscribe to Prime Video standalone at $8.99/mo instead'],
    ['Prime Video standalone is $8.99/mo vs $14.99 for full Prime', 'If you mainly use free shipping, check if you meet Amazon\'s free shipping threshold without Prime', 'Annual Prime at $139/yr ($11.58/mo) is significantly cheaper than monthly'],
    ['"You\'ll lose free 2-day shipping on millions of items"', 'Shows Prime Music, Prime Reading you\'ll lose', 'May offer a pause or reduced rate', '"Prime Video has X new shows this month"'],
    'Annual members get a prorated refund if cancelled early; monthly members get no refund',
    'amazon.com → Account & Lists → Download your data'),

  g('Apple TV+', ['apple tv+', 'apple tv plus', 'appletv+'], 'https://support.apple.com/en-us/HT202039', 'Medium', '3 min',
    ['On iPhone/iPad: Open Settings → tap your Apple ID name → Subscriptions', 'On Mac: Open App Store → click your name → Subscriptions', 'On Apple TV: Settings → Users and Accounts → your Apple ID → Subscriptions', 'Find Apple TV+ and tap it', 'Tap "Cancel Subscription" and confirm'],
    ['Cannot cancel from Apple TV+ website — must go through device Settings or Apple ID', 'If you got Apple TV+ free with a device purchase, confirm the free trial end date'],
    ['Apple TV+ at $9.99/mo has a small but high-quality library — worth reconsidering', 'Apple One Individual ($19.95/mo) includes TV+, Music, Arcade, and 50GB iCloud+ — may be better value'],
    ['"Your shows will be waiting if you return"'],
    'No refunds — access ends at billing period end',
    'Apple Privacy Report: privacy.apple.com → Manage your data → Get a copy of your data'),

  g('Peacock', ['peacock', 'peacocktv'], 'https://www.peacocktv.com/account/subscription', 'Easy', '2 min',
    ['Sign in at peacocktv.com', 'Click your profile icon → Account', 'Under "Plans & Payments", click "Change Plan" or "Cancel Plan"', 'Select "Cancel Plan" and confirm'],
    ['If subscribed through Apple or Google, cancel there instead', 'Peacock has a free tier — you can downgrade instead of cancelling completely'],
    ['Peacock Free gives you access to many shows with ads at no cost', 'NBC live stream and some Peacock originals require paid tier'],
    ['May highlight upcoming Premier League or sports events'],
    'No refunds for unused time',
    'Peacock does not offer a data download'),

  g('Paramount+', ['paramount+', 'paramount plus'], 'https://www.paramountplus.com/account/', 'Easy', '2 min',
    ['Sign in at paramountplus.com', 'Click your name → Account', 'Under "Subscription", click "Cancel Subscription"', 'Review cancellation terms and click "Cancel Subscription" again to confirm'],
    ['If subscribed through Apple, Amazon, or Roku, cancel there'],
    ['Essential plan at $7.99/mo if you just want basic access without Showtime'],
    ['"You\'ll lose access to all Paramount originals and live sports"'],
    'No refunds — access to end of period',
    'No personal data export available'),

  g('YouTube Premium', ['youtube premium', 'youtube music premium'], 'https://www.youtube.com/paid_memberships', 'Easy', '2 min',
    ['Go to youtube.com/paid_memberships (sign in if needed)', 'Find "YouTube Premium" or "YouTube Music Premium"', 'Click "Deactivate" next to the membership', 'Confirm the deactivation on the next screen'],
    ['YouTube Music Premium is a separate subscription from YouTube Premium'],
    ['YouTube Free works perfectly well for most users with ads', 'Consider a browser extension like uBlock Origin to block YouTube ads for free'],
    ['"You\'ll see ads again and lose background play"', 'May offer a reduced rate'],
    'No refunds for partial months',
    'Google Takeout (takeout.google.com) to download YouTube watch/search history'),

  g('Crunchyroll', ['crunchyroll'], 'https://www.crunchyroll.com/account/subscription', 'Easy', '2 min',
    ['Sign in at crunchyroll.com', 'Click your username → Settings', 'Click "Manage Premium" or "Subscription"', 'Click "Cancel Premium"', 'Confirm the cancellation'],
    ['If subscribed through Apple or Google, cancel through those stores'],
    ['Crunchyroll has a free ad-supported tier — consider downgrading instead'],
    ['May offer a discounted month to stay'],
    'No refunds — access to end of period',
    'No data export available'),

  g('DAZN', ['dazn'], 'https://my.dazn.com/account', 'Medium', '3 min',
    ['Log in at dazn.com', 'Click your profile icon → Account', 'Under "Subscription", click "Cancel"', 'Follow the prompts and confirm'],
    ['Monthly plans can be cancelled anytime; annual plans may have early termination fees', 'If you subscribed through Amazon, cancel through Amazon instead'],
    ['Check your specific sports season schedule — you may not need it year-round'],
    ['May show upcoming fights or matches you\'ll miss'],
    'Annual subscribers may owe an early termination fee',
    'No data export available'),

  g('Fubo TV', ['fubo tv', 'fubotv', 'fubo'], 'https://www.fubo.tv/account', 'Medium', '3 min',
    ['Sign in at fubo.tv', 'Go to your Profile → Manage Subscription', 'Click "Cancel Plan"', 'Follow the cancellation prompts and confirm'],
    ['FuboTV bills in advance — cancelling stops future billing but no refund for current period'],
    ['Check if you can downgrade instead of fully cancelling during off-season'],
    ['"You\'ll miss live sports you can\'t find anywhere else"', 'May offer a pause option'],
    'No refunds for the current billing period',
    'No data export'),

  g('Sling TV', ['sling tv', 'sling'], 'https://www.sling.com/account', 'Easy', '2 min',
    ['Sign in at sling.com', 'Click your name → My Account', 'Find "Manage Subscription" or "Cancel Subscription"', 'Follow the prompts to confirm cancellation'],
    ['Sling has monthly billing — no annual commitment'],
    ['Sling Orange or Blue plans at $40/mo vs $55+ for Orange & Blue combined'],
    ['"You can pause your subscription for up to 6 months at $5/mo"'],
    'No refunds — cancel before your billing date to avoid next charge',
    'No personal data export'),

  // ── MUSIC ─────────────────────────────────────────────────────────────────

  g('Spotify', ['spotify'], 'https://www.spotify.com/account/subscription/', 'Easy', '2 min',
    ['Log in at spotify.com/account', 'Click "Manage your plan" or go to spotify.com/account/subscription', 'Scroll down and click "Cancel Premium"', 'Click through to confirm — you drop to Spotify Free tier', 'Your playlists and library are kept on the free tier'],
    ['You lose offline downloads immediately on cancellation', 'Spotify Free still works with ads and shuffle mode'],
    ['Spotify Free is genuinely useful — shuffled playlists on mobile, full control on desktop', 'The $10.99 Individual plan is competitive with all major music services', 'Student plan at $5.99/mo if you have a .edu email'],
    ['May offer 1–3 months at 50% off', '"Your playlist library will stay on Free"', 'Premium Duo offer for couples at $14.99'],
    'No refunds — drops to Free tier at end of billing period',
    'spotify.com/account → Privacy settings → Download your data'),

  g('Apple Music', ['apple music'], null, 'Medium', '3 min',
    ['On iPhone/iPad: Settings → your name → Subscriptions → Apple Music → Cancel', 'On Mac: App Store → Account → Subscriptions → Apple Music → Cancel', 'On PC: iTunes/Apple Music app → Account → View My Account → Manage → Cancel'],
    ['Must cancel through your Apple device, not the Apple Music website', 'Your downloaded music stops playing offline after cancellation'],
    ['Apple Music lossless audio is included at no extra cost vs Spotify', 'Apple One bundle may be cheaper if you use multiple Apple services'],
    ['"Your full library will be waiting if you return"', 'May show recently added songs you\'d lose access to'],
    'No refunds — access to end of billing period',
    'Apple Privacy page: privacy.apple.com → Get a copy of your data'),

  g('Amazon Music', ['amazon music', 'amazon music unlimited'], 'https://www.amazon.com/gp/dmusic/player/settings', 'Medium', '3 min',
    ['Sign in to amazon.com', 'Go to Account & Lists → Music Settings, or visit amazon.com/gp/dmusic/player/settings', 'Click "Cancel Subscription" under your Amazon Music plan', 'Confirm the cancellation'],
    ['If you have Amazon Prime, you already have limited Amazon Music access for free — you\'re cancelling the Unlimited tier'],
    ['Amazon Music Unlimited is discounted to $7.99/mo for Prime members vs $9.99/mo without'],
    ['"You still get millions of songs free with Prime"'],
    'No refunds',
    'amazon.com → Account → Download your data → Music history'),

  g('Tidal', ['tidal'], 'https://account.tidal.com/subscription', 'Easy', '2 min',
    ['Log in at tidal.com', 'Click your profile icon → Subscription', 'Click "Cancel Subscription"', 'Follow prompts and confirm'],
    ['HiFi subscribers note: after cancellation you lose lossless audio access immediately'],
    ['Apple Music offers lossless audio at the same $10.99 price point as Tidal Individual', 'Spotify Free is a solid fallback for casual listening'],
    ['"You\'ll lose access to lossless and exclusive content"'],
    'No refunds — access to end of period',
    'tidal.com → Settings → Privacy → Download your data'),

  g('SoundCloud Go', ['soundcloud go', 'soundcloud'], 'https://soundcloud.com/settings/subscription', 'Easy', '2 min',
    ['Sign in at soundcloud.com', 'Go to soundcloud.com/settings/subscription', 'Click "Cancel Plan"', 'Confirm — you drop to the free SoundCloud tier'],
    ['SoundCloud Free is a decent option for indie/underground music'],
    ['SoundCloud Go+ is mainly useful if you want offline listening or tracks not on Spotify'],
    ['May offer a discounted month'],
    'No refunds',
    'soundcloud.com → Settings → Download your data'),

  g('Pandora', ['pandora', 'pandora premium'], 'https://www.pandora.com/account/delete', 'Easy', '2 min',
    ['Sign in at pandora.com', 'Go to pandora.com/account/delete or Settings → Subscription', 'Click "Cancel Subscription" to return to Pandora Free', 'Confirm the downgrade'],
    ['Pandora Free works as an internet radio with limited skips — still usable'],
    ['Pandora Free is one of the better free music options for passive radio listening'],
    ['"You\'ll lose offline listening and unlimited skips"'],
    'No refunds',
    'Pandora does not offer a data download'),

  g('Deezer', ['deezer'], 'https://www.deezer.com/account/subscription', 'Easy', '2 min',
    ['Sign in at deezer.com', 'Go to deezer.com/account/subscription', 'Click "Cancel subscription"', 'Confirm on the next page'],
    ['If subscribed via Apple or Google, cancel through those stores'],
    ['Deezer Free offers radio mode; Spotify Free has better app experience generally'],
    ['May offer a discount to stay'],
    'No refunds — access to end of period',
    'deezer.com → Settings → Privacy → My Data'),

  // ── SOFTWARE ──────────────────────────────────────────────────────────────

  g('Adobe Creative Cloud', ['adobe creative cloud', 'adobe cc', 'adobe'], 'https://account.adobe.com/plans', 'Hard', '10 min',
    ['Log in at account.adobe.com/plans', 'Click "Manage plan" next to your subscription', 'Click "Cancel plan"', 'Select your cancellation reason and click "Continue"', 'IMPORTANT: If on an annual plan paid monthly, you may owe a 50% early termination fee — check the fee shown on screen', 'If no early termination fee, click "Continue to Cancel"', 'A chat window may appear — you can close it and continue', 'Confirm cancellation on the final screen'],
    ['Annual plans cancelled early owe 50% of remaining months — e.g., cancel 6 months early = pay 3 months', 'Adobe\'s chat bot is designed to stop you — you can ignore it', 'Some users have had success demanding no early termination fee if they threaten to dispute with their bank'],
    ['Photography Plan ($9.99/mo) includes Photoshop + Lightroom — much cheaper if you only need those', 'Single App plan at $20.99/mo if you only use one Adobe app', 'Free alternatives: GIMP (Photoshop), DaVinci Resolve (Premiere), Inkscape (Illustrator)', 'Affinity Suite is a one-time $169 purchase with no subscription'],
    ['"We can offer you 3 months at 40% off"', '"Our agent can help you find a better plan"', 'May highlight Creative Cloud collaboration features you\'ll lose'],
    'Annual paid monthly: 50% early termination fee if cancelled early. Annual paid upfront: partial refund for remaining months. Monthly: no refund.',
    'account.adobe.com → Privacy → Download your data'),

  g('Microsoft 365', ['microsoft 365', 'office 365', 'microsoft office', 'ms365'], 'https://account.microsoft.com/services', 'Medium', '5 min',
    ['Sign in at account.microsoft.com/services', 'Find Microsoft 365 and click "Manage"', 'Click "Cancel subscription"', 'Follow the prompts and confirm', 'You can still use Office apps in view-only mode after cancellation'],
    ['If on annual plan, check for early termination fees', 'After cancellation, you can still view/print existing files but can\'t edit them with Office apps'],
    ['Google Docs/Sheets/Slides is free and very capable for most users', 'LibreOffice is a free desktop Office alternative', 'Microsoft 365 Family at $9.99/mo covers 6 people — much better value if sharing'],
    ['"Your files and OneDrive storage will become read-only"', 'May offer a month free'],
    'Annual subscribers who cancel early may get a prorated refund for unused months',
    'account.microsoft.com → Privacy → Download your data'),

  g('ChatGPT Plus', ['chatgpt plus', 'chatgpt', 'openai'], 'https://chat.openai.com/#settings/subscription', 'Easy', '2 min',
    ['Log in at chat.openai.com', 'Click your profile icon (bottom-left) → Settings', 'Click "Manage subscription" — this opens a Stripe portal', 'Click "Cancel plan" in the Stripe billing portal', 'Confirm cancellation'],
    ['You drop to the free GPT-4o mini tier on cancellation'],
    ['ChatGPT Free (GPT-4o mini) is usable for basic tasks', 'Claude.ai, Gemini, and Copilot all have free tiers as alternatives', 'Consider if you actually use the advanced features regularly'],
    ['"You\'ll lose access to GPT-4, DALL·E, and advanced data analysis"'],
    'No refunds — Pro features available until end of billing period',
    'chat.openai.com → Profile → Manage account → Export data'),

  g('Claude Pro', ['claude pro', 'claude', 'anthropic'], 'https://console.anthropic.com/settings/billing', 'Easy', '2 min',
    ['Sign in at claude.ai or console.anthropic.com', 'Go to Settings → Billing', 'Click "Cancel subscription"', 'Confirm the cancellation'],
    ['You return to Claude Free tier on cancellation'],
    ['Claude Free tier is available and useful for many tasks', 'The free tier includes access to Claude Sonnet'],
    ['"You\'ll lose priority access and extended context window"'],
    'No refunds',
    'No data export available'),

  g('Grammarly', ['grammarly'], 'https://account.grammarly.com/subscription', 'Medium', '3 min',
    ['Log in at account.grammarly.com', 'Click the "Subscription" tab', 'Scroll down and click "Cancel subscription"', 'Select your reason from the dropdown', 'Click "Cancel subscription" again to confirm'],
    ['Annual plans may have a cancellation policy — check before cancelling mid-year'],
    ['Grammarly Free catches basic grammar and spelling — sufficient for many users', 'LanguageTool (free) is a comparable alternative', 'Google Docs has built-in grammar suggestions for free'],
    ['"You\'ll lose access to tone adjustments and full-sentence rewrites"', 'May offer 30% off to stay'],
    'Annual subscriptions: may get a partial refund — contact support. Monthly: no refund.',
    'account.grammarly.com → Security → Manage Your Data'),

  g('Canva Pro', ['canva pro', 'canva'], 'https://www.canva.com/settings/billing', 'Easy', '2 min',
    ['Sign in at canva.com', 'Click your avatar in the top-right → Account settings', 'Click "Billing & Plans" on the left', 'Find your plan and click "Cancel plan"', 'Follow the prompts and confirm — you drop to Canva Free'],
    ['Canva Free retains most of your designs but locks Pro elements'],
    ['Canva Free is remarkably capable — templates, image uploads, and basic design all work', 'Pro elements in existing designs show a watermark on the free tier'],
    ['"You\'ll lose access to 100M+ premium photos and elements"', 'May offer a month free'],
    'Annual plan: partial refund for unused months in some regions. Monthly: no refund.',
    'canva.com → Account settings → Privacy settings → Download your account data'),

  g('Notion', ['notion'], 'https://www.notion.so/profile/billing', 'Easy', '2 min',
    ['Sign in at notion.so', 'Go to Settings → Billing (in the left sidebar)', 'Click "Change plan"', 'Select "Free" plan to downgrade', 'Confirm the downgrade'],
    ['Notion Free is very capable for individual use — unlimited pages and blocks'],
    ['Notion Free plan works great for personal use — only Teams features are paywalled', 'Obsidian (free) is a great local-first alternative'],
    ['"You\'ll lose access to unlimited file uploads and priority support"'],
    'Annual subscribers: partial refund for unused months may be available. Contact support.',
    'notion.so → Settings → Privacy & data → Request my data'),

  g('Evernote', ['evernote'], 'https://www.evernote.com/Settings.action', 'Medium', '3 min',
    ['Sign in at evernote.com', 'Click your profile icon → Settings', 'Go to "Billing" or "Account Summary"', 'Click "Cancel subscription" or "Downgrade to Free"', 'Confirm the downgrade'],
    ['Evernote Free limits you to 1 notebook sync across devices', 'Export your notes before downgrading to be safe'],
    ['Export your notes (File → Export) as HTML or ENEX before cancelling', 'Notion Free and Apple Notes are strong free alternatives'],
    ['May offer a discount'],
    'No refunds',
    'File → Export Notes → Export All Notes as HTML or ENEX format'),

  g('Slack', ['slack'], 'https://app.slack.com/billing', 'Medium', '3 min',
    ['You must be a Workspace Owner to cancel', 'Go to your Slack workspace → Click workspace name → Settings & administration → Billing', 'Click "Change plan" and select "Downgrade to Free"', 'Confirm the downgrade'],
    ['Only Workspace Owners can cancel — Admins cannot', 'The free tier limits message history to 90 days and has fewer integrations'],
    ['Slack Free is functional for small teams — 90 days of history is usually enough', 'Discord (free) is an alternative for community/team chat'],
    ['"You\'ll lose access to message history older than 90 days"', 'May offer a Pro trial extension'],
    'Prorated credit for unused time on annual plans. Contact billing@slack.com.',
    'Slack → Preferences → Import/Export Data → Start Export'),

  g('Zoom', ['zoom'], 'https://zoom.us/billing', 'Easy', '2 min',
    ['Sign in at zoom.us as the account owner', 'Go to Admin → Account Management → Billing', 'Click "Cancel Subscription"', 'Select your reason and confirm'],
    ['Free Zoom limits meetings to 40 minutes for groups — fine for 1-on-1 calls'],
    ['Zoom Free works for unlimited 1-on-1 meetings and 40-min group calls', 'Google Meet (free with Google account) is a solid alternative'],
    ['"You\'ll lose access to cloud recording and unlimited meeting duration"'],
    'Annual plans: prorated refund for unused months. Monthly: no refund.',
    'zoom.us → Account → Account Profile → Privacy → Request account data'),

  g('Dropbox', ['dropbox'], 'https://www.dropbox.com/account/plan', 'Hard', '5 min',
    ['Log in at dropbox.com', 'Click your avatar → Settings → Plan', 'Click "Cancel plan"', 'Enter your reason in the cancellation survey', 'You\'ll be shown a retention screen with offers — decline if you want to cancel', 'Confirm cancellation', 'Download your files before the free 2GB limit kicks in'],
    ['After cancellation you drop to 2 GB free — files over that limit may become inaccessible', 'Download all files before cancelling if you\'re over 2 GB', 'Annual cancellations may get a prorated refund — contact support'],
    ['Google Drive gives 15 GB free — much more than Dropbox\'s 2 GB', 'Download your files first and move them to Google Drive or OneDrive'],
    ['"We can offer you 3 months free if you stay"', '"Your files will be safe for 30 days after cancellation"'],
    'Annual plans: partial refund may be available. Monthly: no refund. Contact support@dropbox.com.',
    'dropbox.com → Account → Security → Export your data'),

  g('LastPass', ['lastpass'], 'https://lastpass.com/account.php', 'Medium', '3 min',
    ['Log in at lastpass.com/account.php', 'Click "Account settings" in the left panel', 'Click on the "Subscription" tab', 'Click "Cancel subscription"', 'Confirm the cancellation — you drop to LastPass Free'],
    ['Export your passwords before cancelling in case you switch services', 'LastPass Free limits sync to one device type (mobile OR computer, not both)'],
    ['Export passwords: Account Options → Export → LastPass CSV file', 'Bitwarden is free, open-source, and syncs across all devices — a superior free option', 'Apple Keychain and Google Password Manager are free and built-in'],
    ['"You\'ll lose sync across all device types"'],
    'No refunds',
    'LastPass → Account Options → Advanced → Export → LastPass CSV file'),

  g('1Password', ['1password', '1 password'], 'https://my.1password.com/settings/billing', 'Easy', '2 min',
    ['Sign in at my.1password.com', 'Go to Settings → Billing', 'Click "Cancel subscription"', 'Confirm the cancellation — your vault is accessible in read-only mode for 30 days'],
    ['Export your passwords before cancelling', 'After 30 days, your vault is frozen — you can\'t access it without resubscribing'],
    ['Export: Settings → Export → 1PUX or CSV format', 'Bitwarden is an excellent free alternative with full sync', 'Apple Keychain is free for Apple ecosystem users'],
    ['"Your vault will be read-only — you won\'t be able to add new items"'],
    'Annual: partial refund may be available — contact support. Monthly: no refund.',
    '1Password → Settings → Export → Export All Items as 1PUX or CSV'),

  g('NordVPN', ['nordvpn', 'nord vpn'], 'https://my.nordaccount.com/dashboard/nordvpn/', 'Hard', '10 min',
    ['Log in at nordvpn.com → My Account', 'Click on "Subscriptions" in the menu', 'Click "Cancel subscription" or turn off auto-renewal', 'You\'ll be taken through multiple retention screens', 'Select your reason, decline the offers, and confirm cancellation'],
    ['NordVPN does not offer cancellation via live chat — must be done through the account dashboard', 'If within 30 days of purchase, you qualify for the money-back guarantee'],
    ['NordVPN has a 30-day money-back guarantee — request a full refund if within 30 days', 'ProtonVPN has a free tier with no speed limits (1 server)', 'Windscribe offers 10 GB/mo free'],
    ['"We can offer you 3 extra months for free if you stay"', '"VPN is important for your security — are you sure?"', 'May show threats/vulnerabilities on public WiFi'],
    '30-day money-back guarantee from purchase date. Contact support via live chat or email to claim refund.',
    'No personal data export (they claim to keep no logs)'),

  g('ExpressVPN', ['expressvpn', 'express vpn'], 'https://www.expressvpn.com/subscriptions', 'Medium', '5 min',
    ['Log in at expressvpn.com → My Account', 'Go to "Subscription" settings', 'Click "Turn off auto-renew" or "Cancel subscription"', 'Confirm the cancellation'],
    ['ExpressVPN offers a 30-day money-back guarantee from date of purchase'],
    ['Contact support within 30 days for a full refund', 'ProtonVPN and Windscribe have free tiers', 'NordVPN and Surfshark are significantly cheaper on annual plans'],
    ['"Your privacy and security will be compromised"', 'May offer additional months free'],
    '30-day money-back guarantee. Contact support via live chat to request refund.',
    'No personal data export'),

  g('Surfshark', ['surfshark'], 'https://my.surfshark.com/account', 'Medium', '3 min',
    ['Log in at surfshark.com → My Account', 'Go to the "Billing" section', 'Click "Cancel subscription" or turn off auto-renewal', 'Confirm the cancellation'],
    ['Surfshark offers a 30-day money-back guarantee'],
    ['Surfshark is already one of the cheapest VPNs — consider if the monthly cost is worth it for your usage', '30-day refund if within the guarantee period'],
    ['May offer extra months to stay'],
    '30-day money-back guarantee from first purchase. Contact support via live chat.',
    'No personal data export'),

  g('Dashlane', ['dashlane'], 'https://app.dashlane.com/account/subscriptions', 'Easy', '2 min',
    ['Log in at app.dashlane.com', 'Go to Account → Subscriptions', 'Click "Cancel subscription"', 'Export your passwords first, then confirm'],
    ['Export passwords before cancelling'],
    ['Bitwarden is a superior free alternative', 'Export: Settings → Export data → Dashlane CSV'],
    ['"Your passwords will no longer sync across devices"'],
    'No refunds',
    'Dashlane → Settings → Export data → Export to CSV'),

  // ── CLOUD STORAGE ──────────────────────────────────────────────────────────

  g('iCloud+', ['icloud+', 'icloud', 'apple icloud'], 'https://support.apple.com/en-us/HT207594', 'Medium', '3 min',
    ['On iPhone: Settings → your name → iCloud → Manage Account Storage → Change Storage Plan', 'Scroll to the bottom and tap "Downgrade Options"', 'Select "Free (5 GB)" to cancel paid storage', 'Confirm — this takes effect at the end of your billing period'],
    ['If your iCloud usage is over 5 GB you\'ll need to delete data or it won\'t sync', 'iCloud Backup and Photo Library will stop syncing if you\'re over the free limit'],
    ['Delete old iPhone backups (Settings → iCloud → Manage Backups) to free space first', 'Google Photos offers 15 GB free storage for photos', 'Move documents to Google Drive before downgrading'],
    ['"Your Photos and backup will stop syncing"'],
    'No refunds — storage continues until end of billing period',
    'Settings → your name → Privacy → Analytics → Request Data (limited)'),

  g('Google One', ['google one', 'google drive storage', 'google storage'], 'https://one.google.com/settings', 'Easy', '2 min',
    ['Go to one.google.com/settings or pay.google.com/subscriptions', 'Find Google One and click "Manage"', 'Click "Cancel subscription"', 'Confirm — you go back to 15 GB free'],
    ['If your Google account is over 15 GB, files won\'t be deleted but you won\'t be able to add more', 'Gmail, Drive, and Photos all share the storage quota'],
    ['Google One 100 GB at $1.99/mo is very affordable — worth considering before cancelling', 'Delete large files in Google Drive and old emails to free up space'],
    ['"Your Google Drive files and Gmail may become inaccessible if over 15 GB"'],
    'No refunds — access continues to end of period',
    'takeout.google.com → Download all your Google data'),

  g('OneDrive', ['onedrive', 'microsoft onedrive'], 'https://account.microsoft.com/services', 'Medium', '3 min',
    ['Sign in at account.microsoft.com/services', 'Find Microsoft 365 or OneDrive and click "Manage"', 'Click "Cancel subscription"', 'Confirm — you drop to 5 GB free'],
    ['If cancelling Microsoft 365, you also lose OneDrive storage', 'Files over 5 GB won\'t be deleted but will become read-only'],
    ['Download your important files before cancelling if over 5 GB', 'Google Drive gives 15 GB free — 3x more than OneDrive free'],
    ['"Your files will become read-only and your subscription benefits will end"'],
    'Annual: prorated refund may be available. Monthly: no refund.',
    'onedrive.live.com → Get a copy of your data'),

  // ── FITNESS ───────────────────────────────────────────────────────────────

  g('Planet Fitness', ['planet fitness'], null, 'Very Hard', '30+ min',
    ['Option 1 — Visit IN PERSON: Go to your specific home club (the one you signed up at) with a valid photo ID', 'Ask the front desk for a cancellation form', 'Fill out the form completely and request a signed confirmation copy for your records', 'Option 2 — Certified Mail: Send a certified letter (return receipt requested) to your home club\'s address', 'Include: your name, address, email on file, and clear statement requesting cancellation', 'Keep the certified mail receipt and return receipt as proof', 'Check your bank account next billing cycle to confirm charges have stopped'],
    ['You CANNOT cancel by phone, email, or online', 'You MUST cancel at your specific home club — not just any Planet Fitness', 'Planet Fitness may claim they never received a letter — certified mail with return receipt is your proof', 'Some locations charge a $25 buyout fee for certain membership types'],
    ['Take a photo of the cancellation form before you leave the club', 'If the charge continues after cancellation, dispute it with your bank and show the certified mail receipt', 'Some states (e.g., California) have stricter gym cancellation laws — you may be able to cancel by email'],
    ['"We can pause your membership for 1–3 months instead"', '"Our Black Card at $24.99 includes more perks"'],
    'Most memberships: cancel effective end of current month. Some plans require 30-day notice — check your contract.',
    'No data export'),

  g('Peloton', ['peloton'], 'https://members.onepeloton.com/profile/subscriptions', 'Medium', '5 min',
    ['App-only members: Log in at onepeloton.com → Profile → Subscriptions → Cancel', 'All-Access (equipment) members: Call Peloton at 1-866-679-9129 or use live chat on their site', 'State clearly you want to cancel — not pause, not downgrade', 'Decline retention offers firmly', 'Request a cancellation confirmation email before hanging up'],
    ['Equipment owners with All-Access: may need to call — the website option is sometimes hidden', 'Peloton has strong retention pressure on the phone — be direct and firm'],
    ['Peloton App Only is $12.99/mo (no equipment required) — cheaper if you already have the bike', 'Pause your membership for up to 3 months at no cost if you\'re temporarily unable to use it', 'YouTube has thousands of free cycling/fitness classes'],
    ['"Would you like to pause for free instead?"', '"We can offer you 3 months at $0 to stay"', '"The All-Access is unique to your bike — you\'ll lose all metrics"'],
    'App: cancel anytime, no refund. All-Access: cancel anytime, no refund for current period.',
    'onepeloton.com → Profile → Privacy → Request my data'),

  g('MyFitnessPal', ['myfitnesspal', 'my fitness pal'], 'https://www.myfitnesspal.com/account/subscriptions', 'Easy', '2 min',
    ['Sign in at myfitnesspal.com', 'Go to Settings → Subscriptions', 'Click "Cancel subscription"', 'Confirm — you drop to the free tier'],
    ['If subscribed via Apple or Google, cancel through those stores'],
    ['MyFitnessPal Free includes calorie tracking and food database — sufficient for most users', 'Cronometer is a free alternative with detailed micronutrient tracking'],
    ['"You\'ll lose premium features like meal planning and macros"'],
    'No refunds',
    'Settings → Privacy → Download my data'),

  g('Headspace', ['headspace'], 'https://www.headspace.com/settings/subscription', 'Easy', '2 min',
    ['Log in at headspace.com', 'Go to Account → Subscriptions', 'Click "Cancel subscription"', 'Confirm — you lose access to premium content'],
    ['If subscribed via Apple or Google, cancel through those stores'],
    ['Insight Timer app is free and has thousands of guided meditations', 'YouTube has free Headspace-style meditation content'],
    ['"You\'ll lose access to all courses and sleepcasts"', 'May offer a discount'],
    'Annual: some refund may be available in first few days. Contact support.',
    'headspace.com → Account → Privacy → Request my data'),

  g('Calm', ['calm'], 'https://www.calm.com/account', 'Medium', '3 min',
    ['Sign in at calm.com', 'Click your profile → Account Settings', 'Under "Subscription", click "Cancel subscription"', 'Select reason and confirm'],
    ['If subscribed via Apple or Google, cancel through those stores', 'Annual plan cancellation mid-year typically gives no refund'],
    ['Insight Timer is free with thousands of meditations', 'YouTube has free guided meditation content', 'Calm has a limited free tier you\'ll drop to'],
    ['"You\'ll lose access to Sleep Stories and breathing exercises"', 'May offer a discounted renewal'],
    'No refunds for annual plans cancelled early. Contact support if within a few days of purchase.',
    'calm.com → Account → Privacy → Download my data'),

  g('Noom', ['noom'], 'https://web.noom.com/account', 'Hard', '10 min',
    ['Log in at web.noom.com', 'Go to Settings → Manage Subscription', 'Click "Cancel subscription"', 'You\'ll be presented with multiple retention screens and offers', 'Continue clicking through to "Cancel Anyway" or similar', 'Look for a small "Cancel" text link if the main buttons don\'t cancel'],
    ['Noom is notorious for making cancellation difficult — "dark patterns"', 'Auto-renewal is aggressive — set a reminder before your trial ends', 'If you can\'t cancel online, email support@noom.com'],
    ['Screenshot each step of the cancellation process as evidence if needed', 'If charged after cancellation attempt, dispute with your bank and show screenshots'],
    ['"You\'ve made so much progress — let us help you finish"', '"We can pause your plan instead"', '"Here\'s a discount to continue"'],
    'Refund policy varies — within 14 days of purchase most regions offer refunds. Contact support.',
    'noom.com → Settings → Privacy → Download my data'),

  g('Apple Fitness+', ['apple fitness+', 'apple fitness plus'], null, 'Medium', '3 min',
    ['On iPhone: Settings → your Apple ID name → Subscriptions → Apple Fitness+ → Cancel', 'On Mac: App Store → Account → Subscriptions → Apple Fitness+ → Cancel', 'Confirm the cancellation'],
    ['Requires an Apple Watch — no point keeping if you no longer use one'],
    ['Apple One Individual ($19.95/mo) includes Fitness+ plus Music, TV+, Arcade, iCloud+ — check if the bundle is better value', 'Nike Training Club is free on iPhone'],
    ['"You\'ll lose access to trainer-led workouts and metrics"'],
    'No refunds — access to end of period',
    'privacy.apple.com → Manage your data → Get a copy'),

  // ── NEWS ──────────────────────────────────────────────────────────────────

  g('New York Times', ['new york times', 'nytimes', 'nyt'], 'https://myaccount.nytimes.com/seg/subscription/cancel', 'Hard', '15 min',
    ['Go to myaccount.nytimes.com and sign in', 'Click "Cancel subscription" — the site will redirect you to live chat', 'Connect to a live chat agent (wait times can be 10–20 minutes)', 'Tell the agent: "I want to cancel my subscription completely, please do not offer me a discount, I just want to cancel"', 'Decline all offers politely but firmly', 'Ask for a confirmation email once cancelled'],
    ['NYT does NOT allow self-service cancellation — live chat is required', 'Chat wait times can be 15–30 minutes during peak hours', 'Agents will make 3–5 retention offers before cancelling — stay firm'],
    ['Try early morning or late evening for shorter chat wait times', 'If you just want to reduce cost, ask for their retention offer first — $1–$4/mo deals are common', 'Guardian, AP News, and Reuters are all free alternatives'],
    ['"We can offer you $1/month for 6 months"', '"Would you like 3 months free instead?"', '"Investigative journalism depends on subscribers like you"'],
    'No refunds — access continues to end of billing period',
    'myaccount.nytimes.com → Privacy → Download your data'),

  g('Washington Post', ['washington post', 'wapo', 'the washington post'], 'https://www.washingtonpost.com/my-post/subscriptions', 'Medium', '5 min',
    ['Sign in at washingtonpost.com', 'Click your profile → Subscriptions & Billing or go to washingtonpost.com/my-post/subscriptions', 'Click "Manage subscription"', 'Click "Cancel subscription"', 'Select reason and confirm'],
    ['Some plans require going through a cancellation flow with agent assistance'],
    ['The Guardian and AP News are free alternatives', 'Amazon Prime members often get free WaPo access — check before paying separately'],
    ['"We can offer you a reduced rate for the next 6 months"'],
    'No refunds — access to end of period',
    'washingtonpost.com → Profile → Privacy → Download data'),

  g('Wall Street Journal', ['wall street journal', 'wsj'], 'https://customercenter.wsj.com/', 'Hard', '10 min',
    ['Go to customercenter.wsj.com or call 1-800-JOURNAL (1-800-568-7625)', 'Online: Log in → Manage Account → Cancel Subscription', 'If online cancellation is not available, call customer service', 'State you want to cancel — they will make 2–3 offers', 'Decline and confirm cancellation', 'Request a confirmation number'],
    ['WSJ may require a phone call to cancel — this is intentional', 'Phone wait times can be long — try calling in the morning'],
    ['MarketWatch (WSJ\'s free site) covers most market news for free', 'Reuters and Bloomberg cover financial news for free', 'WSJ frequently offers $4/mo or $1/wk introductory rates — you can resubscribe at intro rate'],
    ['"We can offer you a discounted rate"', '"Our journalism is critical for financial professionals"'],
    'No refunds — access to end of period',
    'customercenter.wsj.com → Privacy → Download my data'),

  g('Medium', ['medium'], 'https://medium.com/me/membership', 'Easy', '2 min',
    ['Log in at medium.com', 'Click your profile picture → Settings', 'Go to "Membership"', 'Click "Cancel Membership"', 'Confirm the cancellation — you keep 3 free articles/month'],
    ['Non-members can read 3 articles per month for free'],
    ['Pocket, Matter, or Instapaper can save articles you haven\'t read yet', 'Many Medium authors also post on their own free blogs or Substack'],
    ['"Your reading history and follows will be preserved"'],
    'No refunds',
    'medium.com → Settings → Security and privacy → Download your information'),

  g('Kindle Unlimited', ['kindle unlimited', 'kindle'], 'https://www.amazon.com/ku/options', 'Easy', '2 min',
    ['Sign in at amazon.com', 'Go to amazon.com/ku/options or Account → Memberships & Subscriptions → Kindle Unlimited', 'Click "Cancel Kindle Unlimited"', 'Confirm — your borrowed books are removed'],
    ['You lose access to borrowed books immediately on cancellation'],
    ['Return any borrowed books you haven\'t finished before cancelling', 'Libby (free with library card) gives free access to thousands of ebooks', 'Project Gutenberg has 60,000+ free public domain books'],
    ['"You have X books checked out — return them or finish them before cancelling"', 'May offer a free month'],
    'No refunds — access ends at billing period end',
    'amazon.com → Account → Download your data → Kindle data'),

  g('Audible', ['audible'], 'https://www.audible.com/account', 'Medium', '5 min',
    ['Sign in at audible.com', 'Go to Account → Membership Details', 'Click "Cancel membership"', 'Review cancellation terms (your purchased audiobooks remain permanently)', 'Click "Cancel Membership" to confirm'],
    ['You keep all purchased audiobooks permanently — they\'re in your library forever', 'Unused credits expire at cancellation — use them before cancelling'],
    ['Use your credits before cancelling — each credit is worth $14.95', 'Libby (free via library card) has thousands of audiobooks', 'Hoopla offers free audiobooks through your library'],
    ['"You have X unused credits — use them before cancelling"', '"We can pause your membership for 3 months"', '"Your credits will be lost if you cancel now"'],
    'Membership fee: no refund. Purchased audiobooks: retained permanently.',
    'audible.com → Account → Privacy → Download my data'),

  // ── FOOD ──────────────────────────────────────────────────────────────────

  g('DoorDash DashPass', ['doordash dashpass', 'dashpass', 'doordash'], 'https://www.doordash.com/consumer/membership/', 'Easy', '2 min',
    ['Open DoorDash app or go to doordash.com', 'Tap Account → DashPass or go to doordash.com/consumer/membership', 'Tap "Manage DashPass"', 'Tap "Cancel Membership"', 'Confirm the cancellation'],
    ['DashPass annual plans don\'t get prorated refunds'],
    ['Calculate if DashPass saves you more than $9.99/mo in delivery fees — for occasional orders it often doesn\'t', 'Chase Sapphire cardholders and other credit card holders may get DashPass free'],
    ['"You save an average of $X per month with DashPass"', 'May offer a discounted rate'],
    'Monthly: no refund. Annual: contact support for possible prorated refund.',
    'No data export'),

  g('Uber One', ['uber one', 'uber eats', 'ubereats'], 'https://account.uber.com/membership', 'Easy', '2 min',
    ['Open the Uber or Uber Eats app', 'Tap your profile → Uber One', 'Tap "Manage membership"', 'Tap "Cancel membership"', 'Confirm the cancellation'],
    ['Annual plans: contact support for refund policy'],
    ['Calculate if Uber One saves you more than $9.99/mo in fees and discounts', 'Some credit cards include Uber One membership free'],
    ['"You saved $X this month with Uber One"'],
    'Monthly: no refund. Annual: contact support.',
    'privacy.uber.com → Request a copy of your data'),

  g('HelloFresh', ['hellofresh', 'hello fresh'], 'https://www.hellofresh.com/my-account/deliveries/menu', 'Hard', '5 min',
    ['Log in at hellofresh.com', 'Click your profile icon → Account Settings → Subscription', 'Scroll down to find "Cancel Plan" (it may be hidden under "Pause" options — look carefully)', 'Click "Cancel Plan"', 'Select your reason and click "Cancel Plan" again to confirm', 'IMPORTANT: Cancel at least 5 days before your next delivery date or that box will still ship'],
    ['You must cancel before the weekly cutoff (usually 5 days before delivery) or the next box ships and will be charged', 'The "Cancel" button is deliberately hard to find — look past the pause options'],
    ['If you want a break, use the "Pause" feature instead of cancelling', 'EveryPlate (by HelloFresh) is a cheaper meal kit from the same company at ~$4.99/serving'],
    ['"We can send you 3 free meals if you stay"', '"Pause for up to 8 weeks instead of cancelling"', '"We\'ll give you 50% off your next box"'],
    'No refunds once a box has shipped. Cancel before cutoff to avoid next charge.',
    'hellofresh.com → Account → Privacy → Download my data'),

  g('Blue Apron', ['blue apron', 'blueapron'], 'https://www.blueapron.com/account/subscription', 'Medium', '3 min',
    ['Sign in at blueapron.com', 'Go to Account → Subscription Settings', 'Click "Cancel Plan"', 'Select reason and confirm'],
    ['Must cancel before weekly cutoff (usually Thursday midnight ET) to avoid the next shipment'],
    ['EveryPlate and Dinnerly are cheaper meal kit alternatives', 'Cancelling and resubscribing at promotional rates is common and accepted'],
    ['"Pause for up to 8 weeks instead"', 'May offer free boxes or steep discounts'],
    'No refunds on shipped orders. Cancel before cutoff.',
    'blueapron.com → Account → Privacy settings → Download data'),

  g('Instacart+', ['instacart+', 'instacart plus', 'instacart'], 'https://www.instacart.com/store/account/instacart_plus', 'Easy', '2 min',
    ['Log in at instacart.com or open the app', 'Go to Account → Instacart+', 'Click or tap "Manage your membership"', 'Click "Cancel membership"', 'Confirm the cancellation'],
    ['Annual plans: check refund policy before cancelling'],
    ['Many grocery stores offer their own delivery services without a membership fee', 'Calculate if you order often enough to break even on the $9.99/mo fee'],
    ['"You save an average of $X per month with Instacart+"'],
    'Monthly: no refund. Annual: contact support for prorated refund.',
    'No data export'),

  // ── SHOPPING ──────────────────────────────────────────────────────────────

  g('Amazon Prime', ['amazon prime', 'prime membership'], 'https://www.amazon.com/gp/primecentral', 'Medium', '3 min',
    ['Sign in at amazon.com', 'Hover over "Account & Lists" → "Prime Membership"', 'Click "Manage Membership" in the left column', 'Click "End Membership"', 'Click through the "you\'ll lose these benefits" screen by clicking "Continue to Cancel"', 'Choose to cancel immediately or at end of period and confirm'],
    ['Amazon shows 6+ screens of benefits you\'ll lose — this is intentional to stop you', 'Cancelling Prime cancels ALL Prime benefits: shipping, video, music, reading, etc.', 'Prime Video standalone at $8.99/mo if you only want streaming'],
    ['Annual Prime at $139/yr ($11.58/mo) is much cheaper than monthly $14.99/mo', 'Student Prime is $7.49/mo with a .edu email', 'Calculate if you actually use $14.99/mo worth of shipping and benefits'],
    ['"You\'ll lose free 2-day shipping on millions of items"', '"Your Prime Video watchlist will be lost"', '"Prime Photos backup will stop"', 'May offer a pause option'],
    'Annual members: prorated refund if you haven\'t used Prime benefits recently. Monthly: no refund. Contact Amazon support.',
    'amazon.com → Account → Download your data'),

  g('Walmart+', ['walmart+', 'walmart plus'], 'https://www.walmart.com/plus/account', 'Easy', '2 min',
    ['Sign in at walmart.com', 'Click your account icon → Walmart+', 'Go to Walmart+ settings → "Cancel membership"', 'Confirm the cancellation'],
    ['Annual plans: limited refund window — check at time of cancellation'],
    ['Calculate if free delivery savings + Paramount+ inclusion exceeds $12.95/mo for your usage'],
    ['"You\'ll lose free grocery delivery and Paramount+ access"'],
    'Monthly: no refund. Annual: contact support within 30 days for refund if unused.',
    'No data export'),

  g('Costco', ['costco', 'costco membership'], null, 'Hard', '15 min',
    ['Option 1 — In warehouse: Visit any Costco warehouse and go to the membership counter', 'Ask to cancel your membership — bring your membership card and photo ID', 'Option 2 — Phone: Call 1-800-774-2678 (member services)', 'Confirm cancellation and ask about refund — Costco has a 100% satisfaction guarantee on memberships'],
    ['Costco does NOT allow online membership cancellation'],
    ['Costco has a full money-back guarantee on memberships — you can get a prorated refund for unused months', 'Use your Costco cash/rewards before cancelling'],
    ['"We can pause your membership"', '"The Executive membership pays for itself with 2% back"'],
    'Full prorated refund available — Costco has a 100% membership satisfaction guarantee.',
    'No data export'),

  g("Sam's Club", ['sams club', "sam's club"], 'https://www.samsclub.com/account/membership', 'Medium', '3 min',
    ["Sign in at samsclub.com → Account → Membership", "Click 'Cancel membership' or call 1-888-746-7726", "Confirm the cancellation — you keep access until the period ends"],
    ["Use any remaining cash rewards before cancelling"],
    ["Sam's Club offers a prorated refund within the first year if not satisfied", "Make sure to use any Instant Savings or cash rewards before cancelling"],
    ['"We can offer you a discounted renewal"'],
    "Prorated refund available within 1 year — satisfaction guaranteed.",
    'No data export'),

  // ── GAMING ────────────────────────────────────────────────────────────────

  g('Xbox Game Pass', ['xbox game pass', 'game pass', 'xbox', 'microsoft gaming'], 'https://account.microsoft.com/services', 'Medium', '3 min',
    ['Sign in at account.microsoft.com/services', 'Find Xbox Game Pass in the list', 'Click "Cancel"', 'Turn off recurring billing or click "Cancel subscription"', 'Choose to cancel at end of period and confirm'],
    ['Games you downloaded through Game Pass will no longer work after cancellation', 'Any saved progress for Game Pass games is kept — you can pick up where you left off if you resubscribe'],
    ['Epic Games gives free games every 2 weeks — great free alternative for casual gamers', 'Save any game progress or screenshots before cancelling'],
    ['"You\'ll lose access to X games in your library"', '"Game Pass Ultimate is the best value in gaming"', 'May offer a discounted month'],
    'No refunds — access continues to end of billing period',
    'account.microsoft.com → Privacy → Download your data'),

  g('PlayStation Plus', ['playstation plus', 'ps plus', 'psn'], 'https://store.playstation.com/subscriptions', 'Medium', '5 min',
    ['Sign in at playstation.com or on your PS5/PS4', 'Go to PlayStation Store → Subscriptions → PS Plus', 'Or on console: Settings → Account Management → Account Information → PlayStation Subscriptions', 'Select PS Plus and click "Cancel automatic renewal"', 'Confirm the cancellation'],
    ['You lose access to PS Plus monthly games if you cancel — though purchased games remain', 'Online multiplayer requires PS Plus on PS4/PS5'],
    ['Annual PS Plus Essential at $79.99/yr ($6.67/mo) is much cheaper than monthly $9.99', 'PS Plus monthly "free" games are only accessible while subscribed', 'Some games offer free online multiplayer (Fortnite, Warzone, etc.)'],
    ['"You\'ll lose access to your monthly free games"', '"Online multiplayer will be disabled"', 'May offer a discounted rate'],
    'Annual plans: contact PlayStation support for possible prorated refund. Monthly: no refund.',
    'playstation.com → Privacy → Access my data'),

  g('Nintendo Switch Online', ['nintendo switch online', 'nintendo online', 'nintendo switch'], 'https://ec.nintendo.com/my/membership', 'Easy', '2 min',
    ['Sign in at nintendo.com or on your Nintendo Switch', 'On Switch: eShop → Your profile → Nintendo Switch Online', 'Or online: nintendo.com → Membership → Manage', 'Disable auto-renewal', 'Your membership continues until the end of the paid period'],
    ['Nintendo Switch Online is required for online play on Switch games', 'Family Plan ($34.99/yr) covers up to 8 Nintendo accounts — much better value for households'],
    ['Annual plan at $19.99/yr is only $1.67/mo — cancelling saves very little', 'Family Plan at $34.99/yr is only $2.92/mo for up to 8 users'],
    ['"You\'ll lose access to online play and NES/SNES games"'],
    'No refunds — access continues to end of period',
    'No personal data export'),

  g('EA Play', ['ea play', 'ea access', 'ea'], 'https://myaccount.ea.com/subscriptions', 'Easy', '2 min',
    ['Log in at myaccount.ea.com/subscriptions', 'Find EA Play and click "Cancel subscription"', 'Confirm the cancellation'],
    ['EA Play is included with Xbox Game Pass Ultimate — if you have that, you don\'t need separate EA Play'],
    ['EA Play annual at $29.99/yr ($2.49/mo) is very cheap — consider if worth keeping', 'Xbox Game Pass Ultimate includes EA Play for PC at $19.99/mo'],
    ['"You\'ll lose access to the Game Library and 10-hour trials"'],
    'No refunds — access continues to end of period',
    'privacy.ea.com → Access my data'),

  // ── OTHER ─────────────────────────────────────────────────────────────────

  g('LinkedIn Premium', ['linkedin premium', 'linkedin'], 'https://www.linkedin.com/psettings/account', 'Medium', '3 min',
    ['Sign in at linkedin.com', 'Click your profile picture → Premium subscription or Settings', 'Go to Subscriptions', 'Click "Cancel subscription"', 'Select your reason and confirm cancellation'],
    ['LinkedIn sometimes makes the cancel button hard to find — go to linkedin.com/psettings/account directly'],
    ['LinkedIn Free is sufficient for most job searching and networking', 'InMail credits are lost on cancellation — use them before cancelling', 'LinkedIn Premium is most valuable if actively job searching or recruiting'],
    ['"You\'ll lose access to who viewed your profile in the past 90 days"', '"We can offer you 1 month free"', '"Premium Career boosts your job application chances"'],
    'No refunds — access continues to end of period',
    'linkedin.com → Me → Settings & Privacy → Data Privacy → Get a copy of your data'),

  g('Duolingo Plus', ['duolingo plus', 'duolingo super', 'duolingo'], 'https://www.duolingo.com/settings/subscription', 'Easy', '2 min',
    ['Sign in at duolingo.com or open the app', 'Go to Profile → Settings → Subscription / Super Duolingo', 'Click "Cancel subscription"', 'If subscribed via Apple or Google, cancel through those stores instead', 'Confirm the cancellation'],
    ['If subscribed via Apple/Google, you must cancel through those stores'],
    ['Duolingo Free is almost identical to Plus — the main differences are no ads and unlimited hearts', 'Language Transfer (free podcast-style courses) is excellent for Spanish, French, German'],
    ['"You\'ll lose unlimited hearts and ad-free learning"', 'May offer a reduced rate'],
    'No refunds — access to end of period',
    'No data export'),

  g('Coursera Plus', ['coursera plus', 'coursera'], 'https://www.coursera.org/account-settings', 'Medium', '3 min',
    ['Sign in at coursera.org', 'Go to Account Settings → Subscriptions', 'Click "Cancel subscription" next to Coursera Plus', 'Select reason and confirm'],
    ['Completed course certificates remain on your profile after cancellation', 'Annual plan: check refund policy — may be available within 14 days'],
    ['Coursera offers individual courses free to audit (without certificate)', 'Many courses are available free through edX, MIT OpenCourseWare, or Khan Academy'],
    ['"You have X courses in progress — finish them before you lose access"'],
    'Monthly: no refund. Annual: full refund within 14 days of purchase if unsatisfied. Contact support.',
    'coursera.org → Profile → Privacy → Download your data'),

  g('Skillshare', ['skillshare'], 'https://www.skillshare.com/settings/payments', 'Easy', '2 min',
    ['Log in at skillshare.com', 'Go to Account → Payment & Subscriptions', 'Click "Cancel Membership"', 'Select reason and confirm'],
    ['Annual plan members get less flexibility for refunds'],
    ['YouTube has extensive free creative tutorials on the same topics as Skillshare', 'Coursera and edX offer free course auditing'],
    ['"Your class saves and favorites will be waiting if you return"', 'May offer a free month'],
    'Monthly: no refund. Annual: contact support within 7 days for refund.',
    'No data export'),

  g('Tinder Gold', ['tinder gold', 'tinder plus', 'tinder platinum', 'tinder'], null, 'Medium', '3 min',
    ['iOS: Open Settings → your Apple ID → Subscriptions → Tinder → Cancel', 'Android: Open Google Play → Profile → Payments & subscriptions → Subscriptions → Tinder → Cancel', 'If subscribed directly: tinder.com/manage-account → Subscription → Cancel'],
    ['iOS and Android subscriptions MUST be cancelled through the App Store/Play Store — not in the app itself', 'Cancelling stops renewal but you keep Gold/Plus until the end of the paid period'],
    ['Tinder Free allows matching and messaging — just without boosts and super likes', 'Bumble and Hinge have free tiers with comparable matching'],
    ['"You\'ll lose your Super Likes and Boosts"'],
    'No refunds — access continues to end of period',
    'tinder.com → Settings → Privacy → Download my data'),

  g('Bumble Premium', ['bumble premium', 'bumble boost', 'bumble'], null, 'Medium', '3 min',
    ['iOS: Settings → your Apple ID → Subscriptions → Bumble → Cancel', 'Android: Google Play → Profile → Payments & subscriptions → Bumble → Cancel', 'Web: bumble.com → Profile → Manage Subscription → Cancel'],
    ['Must cancel through App Store/Play Store if subscribed there', 'Bumble Boost (not Premium) is a separate, cheaper tier'],
    ['Bumble Free allows swiping and messaging — the core features are free', 'Hinge, Tinder, and OkCupid have free tiers'],
    ['"You\'ll lose access to Rematch, Spotlight, and SuperSwipes"'],
    'No refunds — access to end of period',
    'bumble.com → Settings → Privacy → Export my data'),

  g('Match.com', ['match.com', 'match'], 'https://www.match.com/account/membership', 'Hard', '10 min',
    ['Sign in at match.com', 'Go to Settings → My Account → Subscription', 'Click "Cancel subscription"', 'You\'ll go through a multi-step cancellation flow', 'Decline any offers and look for the final "Cancel subscription" confirmation', 'Request confirmation by email'],
    ['Match.com subscriptions auto-renew — set a calendar reminder 3 days before renewal', 'If within 3 days of a charge, contact support immediately for a possible refund'],
    ['Many users get a cheaper rate by going through cancellation and accepting a retention offer', 'Document each cancellation step with screenshots as proof'],
    ['"We can offer you 6 months for the price of 3"', '"You\'re so close to finding your match!"', 'May show profile views and likes you\'ll lose'],
    'No refunds for unused time generally. Contact support within 3 days of last charge if charged unexpectedly.',
    'match.com → Settings → Privacy → Request my data'),

  g('Patreon', ['patreon'], 'https://www.patreon.com/settings/memberships', 'Easy', '2 min',
    ['Log in at patreon.com', 'Go to patreon.com/settings/memberships', 'Find the creator you want to unsubscribe from', 'Click "Edit" → "Cancel Membership"', 'Confirm — this ends your support of that specific creator'],
    ['You need to cancel each creator membership individually — there\'s no "cancel all" button', 'Cancelling stops the next charge — you keep access until the end of the paid period'],
    ['Most creators are independent — consider if you value their work before cancelling', 'You can set a lower tier instead of fully cancelling'],
    ['"Your creator may lose support they rely on"'],
    'No refunds — access continues to end of period',
    'patreon.com → Settings → Privacy → Download your data'),

  g('BetterHelp', ['betterhelp', 'better help'], 'https://www.betterhelp.com/member/account', 'Hard', '5 min',
    ['Log in at betterhelp.com', 'Go to Account Settings → Subscription', 'Click "Quit / Pause" or "Cancel subscription"', 'If no option visible, send a message to support@betterhelp.com requesting cancellation', 'Request a confirmation email'],
    ['Some users cannot find a cancel button and must email support', 'BetterHelp billing is weekly — set a reminder to cancel before each weekly charge'],
    ['Request a financial aid discount if cost is the issue — significant reductions are available', 'Open Path Collective offers sliding-scale in-person therapy at $30–$80/session'],
    ['"Would you like to pause instead?"', '"We can match you with a different therapist"'],
    'Refunds may be available for unused sessions within 30 days — contact support.',
    'betterhelp.com → Account → Privacy → Download my data'),

  g('Chegg', ['chegg'], 'https://www.chegg.com/myaccount/subscriptions', 'Medium', '3 min',
    ['Sign in at chegg.com', 'Go to My Account → My Subscriptions or chegg.com/myaccount/subscriptions', 'Click "Cancel subscription"', 'Select reason and confirm'],
    ['Return any textbooks before cancelling if using Chegg physical rentals'],
    ['Many university libraries have free online textbook access', 'LibGen and Anna\'s Archive have free textbook alternatives (check legality in your region)', 'Khan Academy is free for tutoring and homework help'],
    ['"You have study help questions remaining"', 'May offer a discounted rate for students'],
    'No refunds — access to end of billing period',
    'chegg.com → Account → Privacy → Download my data'),
]

// ─── Helpers ──────────────────────────────────────────────────────────────

export function findCancellationGuide(name) {
  if (!name) return null
  const norm = name.toLowerCase().trim()
  return CANCELLATION_GUIDES.find(guide => {
    const gn = guide.name.toLowerCase()
    return (
      gn === norm ||
      norm.includes(gn) ||
      gn.includes(norm) ||
      guide.searchAliases.some(a => norm.includes(a) || a.includes(norm.split(' ')[0]))
    )
  }) || null
}

export function getDifficultyColor(difficulty) {
  switch (difficulty) {
    case 'Easy': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    case 'Medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    case 'Hard': return 'text-orange-400 bg-orange-500/10 border-orange-500/30'
    case 'Very Hard': return 'text-red-400 bg-red-500/10 border-red-500/30'
    default: return 'text-slate-400 bg-slate-700/30 border-slate-600/30'
  }
}

export function getDifficultyIcon(difficulty) {
  switch (difficulty) {
    case 'Easy': return '🟢'
    case 'Medium': return '🟡'
    case 'Hard': return '🟠'
    case 'Very Hard': return '🔴'
    default: return '❓'
  }
}

export function getDifficultyEmoji(difficulty) {
  switch (difficulty) {
    case 'Easy': return '✅'
    case 'Medium': return '⚠️'
    case 'Hard': return '💀'
    case 'Very Hard': return '☠️'
    default: return '❓'
  }
}

export const GUIDE_CATEGORIES = ['All', 'Streaming', 'Music', 'Software', 'Cloud Storage', 'Fitness', 'News', 'Food', 'Shopping', 'Gaming', 'Other']

export function getGuideCategory(guide) {
  const streaming = ['Netflix', 'Hulu', 'Disney+', 'HBO Max', 'Amazon Prime Video', 'Apple TV+', 'Peacock', 'Paramount+', 'YouTube Premium', 'Crunchyroll', 'DAZN', 'Fubo TV', 'Sling TV']
  const music = ['Spotify', 'Apple Music', 'Amazon Music', 'Tidal', 'SoundCloud Go', 'Pandora', 'Deezer']
  const software = ['Adobe Creative Cloud', 'Microsoft 365', 'ChatGPT Plus', 'Claude Pro', 'Grammarly', 'Canva Pro', 'Notion', 'Evernote', 'Slack', 'Zoom', 'Dropbox', 'LastPass', '1Password', 'NordVPN', 'ExpressVPN', 'Surfshark', 'Dashlane']
  const cloud = ['iCloud+', 'Google One', 'OneDrive']
  const fitness = ['Planet Fitness', 'Peloton', 'MyFitnessPal', 'Headspace', 'Calm', 'Noom', 'Apple Fitness+']
  const news = ['New York Times', 'Washington Post', 'Wall Street Journal', 'Medium', 'Kindle Unlimited', 'Audible']
  const food = ['DoorDash DashPass', 'Uber One', 'HelloFresh', 'Blue Apron', 'Instacart+']
  const shopping = ['Amazon Prime', 'Walmart+', 'Costco', "Sam's Club"]
  const gaming = ['Xbox Game Pass', 'PlayStation Plus', 'Nintendo Switch Online', 'EA Play']
  if (streaming.includes(guide.name)) return 'Streaming'
  if (music.includes(guide.name)) return 'Music'
  if (software.includes(guide.name)) return 'Software'
  if (cloud.includes(guide.name)) return 'Cloud Storage'
  if (fitness.includes(guide.name)) return 'Fitness'
  if (news.includes(guide.name)) return 'News'
  if (food.includes(guide.name)) return 'Food'
  if (shopping.includes(guide.name)) return 'Shopping'
  if (gaming.includes(guide.name)) return 'Gaming'
  return 'Other'
}

export const CANCELLATION_CHECKLIST_ITEMS = [
  { id: 'contract', text: 'Check if you are in a contract period (early termination fees?)' },
  { id: 'data', text: 'Download any data, files, or content you want to keep' },
  { id: 'credits', text: 'Check for unused credits, prepaid balance, or gift cards' },
  { id: 'retention', text: 'Look for retention / discount offers before saying yes' },
  { id: 'cancel', text: 'Actually cancel the service' },
  { id: 'confirmation', text: 'Get confirmation email or confirmation number' },
  { id: 'reminder', text: 'Set a reminder to verify the charge actually stopped' },
  { id: 'verify', text: 'Check next bank statement to confirm it stopped' },
]
