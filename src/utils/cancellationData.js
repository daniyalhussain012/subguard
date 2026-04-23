export const CANCELLATION_GUIDES = {
  'Netflix': {
    url: 'https://www.netflix.com/cancelplan',
    difficulty: 'Easy',
    timeEstimate: '~2 minutes',
    steps: [
      'Go to netflix.com and sign in',
      'Click your profile icon → Account',
      'Scroll to "Membership & Billing"',
      'Click "Cancel Membership"',
      'Confirm cancellation — you keep access until end of billing period',
    ],
    warnings: [],
    retentionTactics: ['May offer a discounted month to stay'],
  },
  'Spotify': {
    url: 'https://www.spotify.com/account/subscription/',
    difficulty: 'Easy',
    timeEstimate: '~3 minutes',
    steps: [
      'Go to spotify.com/account',
      'Click "Change plan" or "Cancel Premium"',
      'Select "Cancel Premium"',
      'You drop to Free tier — your playlists are kept',
    ],
    warnings: ['You lose offline downloads immediately'],
    retentionTactics: ['May offer 1-3 months at 50% off'],
  },
  'Amazon Prime': {
    url: 'https://www.amazon.com/gp/primecentral',
    difficulty: 'Medium',
    timeEstimate: '~5 minutes',
    steps: [
      'Go to amazon.com → Account & Lists → Prime Membership',
      'Click "Manage membership"',
      'Select "End Membership"',
      'Amazon shows what you lose — click "Continue to Cancel"',
      'Choose: cancel now or at end of period',
    ],
    warnings: ['Multi-step process designed to confuse', 'Free returns may be affected'],
    retentionTactics: ['Shows everything you lose screen by screen', 'May offer a pause instead'],
  },
  'Adobe Creative Cloud': {
    url: 'https://account.adobe.com/plans',
    difficulty: 'Hard',
    timeEstimate: '~10 minutes',
    steps: [
      'Go to account.adobe.com/plans',
      'Click "Manage plan" next to your subscription',
      'Click "Cancel plan"',
      'Choose reason and click "Continue"',
      'If on annual plan, check early termination fee',
      'Confirm cancellation',
    ],
    warnings: ['Annual plans may have 50% early termination fee', 'Chat bot tries to stop you'],
    retentionTactics: ['Offers discounts aggressively', 'Chat agent may match competitor prices'],
  },
  'Apple': {
    url: 'https://support.apple.com/en-us/HT202039',
    difficulty: 'Easy',
    timeEstimate: '~3 minutes',
    steps: [
      'Open Settings → tap your name → Subscriptions',
      'OR: App Store → tap your account → Subscriptions',
      'Tap the subscription you want to cancel',
      'Tap "Cancel Subscription"',
      'Confirm',
    ],
    warnings: [],
    retentionTactics: [],
  },
  'Google': {
    url: 'https://play.google.com/store/account/subscriptions',
    difficulty: 'Easy',
    timeEstimate: '~3 minutes',
    steps: [
      'Go to play.google.com/store/account/subscriptions',
      'Find your subscription',
      'Click "Manage" → "Cancel subscription"',
      'Select reason and confirm',
    ],
    warnings: [],
    retentionTactics: [],
  },
  'Hulu': {
    url: 'https://secure.hulu.com/account/cancel',
    difficulty: 'Medium',
    timeEstimate: '~5 minutes',
    steps: [
      'Go to hulu.com → Account',
      'Under "Your Subscription", click "Cancel"',
      'Follow the prompts',
      'Confirm cancellation',
    ],
    warnings: ['If subscribed via Apple/Google, cancel through them instead'],
    retentionTactics: ['May offer discounted plan'],
  },
  'Disney+': {
    url: 'https://www.disneyplus.com/account/subscription',
    difficulty: 'Easy',
    timeEstimate: '~3 minutes',
    steps: [
      'Go to disneyplus.com and sign in',
      'Click your profile → Account',
      'Under "Subscription", click "Cancel Subscription"',
      'Confirm',
    ],
    warnings: [],
    retentionTactics: [],
  },
  'HBO Max': {
    url: 'https://www.max.com/account',
    difficulty: 'Easy',
    timeEstimate: '~3 minutes',
    steps: [
      'Sign in at max.com',
      'Go to Account Settings',
      'Click "Cancel Subscription"',
      'Follow the prompts',
    ],
    warnings: ['If via Amazon Channels, cancel through Amazon'],
    retentionTactics: [],
  },
  'YouTube Premium': {
    url: 'https://www.youtube.com/paid_memberships',
    difficulty: 'Easy',
    timeEstimate: '~2 minutes',
    steps: [
      'Go to youtube.com/paid_memberships',
      'Click "Deactivate" next to YouTube Premium',
      'Confirm',
    ],
    warnings: [],
    retentionTactics: [],
  },
  'ChatGPT Plus': {
    url: 'https://chat.openai.com/#settings/subscription',
    difficulty: 'Easy',
    timeEstimate: '~2 minutes',
    steps: [
      'Go to chat.openai.com',
      'Click your profile → Settings',
      'Click "Manage subscription"',
      'Click "Cancel plan" in the Stripe portal',
    ],
    warnings: [],
    retentionTactics: [],
  },
  'Dropbox': {
    url: 'https://www.dropbox.com/account/plan',
    difficulty: 'Medium',
    timeEstimate: '~5 minutes',
    steps: [
      'Go to dropbox.com/account/plan',
      'Click "Cancel plan"',
      'Enter reason',
      'Confirm — you keep data for 30 days, then it may be deleted if over free limit',
    ],
    warnings: ['Data may be deleted if over free tier limit after cancel'],
    retentionTactics: ['May offer extended free trial or discount'],
  },
  'Planet Fitness': {
    url: null,
    difficulty: 'Very Hard',
    timeEstimate: '~30-60 minutes (requires visit or certified mail)',
    steps: [
      'Visit your home club IN PERSON with photo ID',
      'OR send a certified letter to your home club (find address on membership card)',
      'Request cancellation form from front desk',
      'Fill out and submit — get a written confirmation copy',
      'Check your bank that charges have stopped next cycle',
    ],
    warnings: ['Cannot cancel online or by phone', 'Must go to your specific home club', 'Keep your certified mail receipt as proof'],
    retentionTactics: ['May offer free month pause', 'May claim they never received your letter — send certified mail'],
  },
  'LinkedIn Premium': {
    url: 'https://www.linkedin.com/subscriptions/',
    difficulty: 'Medium',
    timeEstimate: '~5 minutes',
    steps: [
      'Go to linkedin.com/subscriptions',
      'Click "Cancel subscription"',
      'Select cancellation reason',
      'Confirm',
    ],
    warnings: [],
    retentionTactics: ['Offers skill insights showing value you get', 'May offer 1 month free'],
  },
  'Grammarly': {
    url: 'https://account.grammarly.com/subscription',
    difficulty: 'Easy',
    timeEstimate: '~3 minutes',
    steps: [
      'Go to account.grammarly.com',
      'Click "Subscription" tab',
      'Click "Cancel subscription"',
      'Confirm',
    ],
    warnings: [],
    retentionTactics: [],
  },
  'Canva': {
    url: 'https://www.canva.com/settings/purchase-history',
    difficulty: 'Easy',
    timeEstimate: '~3 minutes',
    steps: [
      'Go to canva.com/settings/purchase-history',
      'Click "Cancel subscription"',
      'Select reason and confirm',
    ],
    warnings: [],
    retentionTactics: [],
  },
  'Notion': {
    url: 'https://www.notion.so/my-account',
    difficulty: 'Easy',
    timeEstimate: '~2 minutes',
    steps: [
      'Go to notion.so/my-account',
      'Click "Plans" tab',
      'Click "Downgrade" or "Cancel subscription"',
    ],
    warnings: [],
    retentionTactics: [],
  },
  'Zoom': {
    url: 'https://zoom.us/billing',
    difficulty: 'Medium',
    timeEstimate: '~5 minutes',
    steps: [
      'Sign in at zoom.us',
      'Go to Admin → Account Management → Billing',
      'Click "Cancel Subscription"',
      'Confirm',
    ],
    warnings: [],
    retentionTactics: [],
  },
  'Slack': {
    url: 'https://app.slack.com/plans',
    difficulty: 'Easy',
    timeEstimate: '~3 minutes',
    steps: [
      'Go to your Slack workspace',
      'Click workspace name → Settings & Administration → Billing',
      'Select downgrade or cancel',
    ],
    warnings: [],
    retentionTactics: [],
  },
  'Peloton': {
    url: 'https://account.onepeloton.com/settings',
    difficulty: 'Hard',
    timeEstimate: '~15 minutes (requires phone call)',
    steps: [
      'Call Peloton support: 1-866-679-9129',
      'Tell them you want to cancel your All-Access or App membership',
      'They WILL try to offer discounts and pause options',
      'Stay firm and confirm cancellation verbally',
      'Request cancellation confirmation email',
    ],
    warnings: ['Cannot cancel online', 'Phone hold times can be 20+ minutes', 'Strong retention pressure'],
    retentionTactics: ['Pause for up to 3 months', '3 months at 50% off', 'Threaten escalation works sometimes'],
  },
  'HelloFresh': {
    url: 'https://www.hellofresh.com/my-account/subscriptions',
    difficulty: 'Medium',
    timeEstimate: '~5 minutes',
    steps: [
      'Log in to hellofresh.com',
      'Go to Account Settings → Subscription',
      'Click "Cancel Subscription" (may be hidden in "Pause" options)',
      'Select reason and confirm',
    ],
    warnings: ['Must cancel before cutoff deadline or next box ships', 'Cancel button is hard to find'],
    retentionTactics: ['Offers free boxes', 'Strongly pushes pause over cancel'],
  },
  'New York Times': {
    url: 'https://myaccount.nytimes.com/seg/subscription/cancel',
    difficulty: 'Very Hard',
    timeEstimate: '~15-30 minutes (requires live chat)',
    steps: [
      'Go to myaccount.nytimes.com',
      'Click "Cancel subscription"',
      'You MUST go through live chat — cancellation page redirects you',
      'Tell the agent you want to cancel completely',
      'Decline all offers and confirm cancel',
    ],
    warnings: ['Live chat required — no self-service cancel', 'Chat wait times can be 15+ minutes', 'Very aggressive retention'],
    retentionTactics: ['Offers $1/month deals', 'Offers free months', 'Guilt trips about journalism'],
  },
}

export const CANCELLATION_CHECKLIST_ITEMS = [
  { id: 'contract', text: 'Check if you are in a contract period (early termination fees?)' },
  { id: 'data', text: 'Download any data, files, or content you want to keep' },
  { id: 'credits', text: 'Check for unused credits, prepaid balance, or gift cards' },
  { id: 'retention', text: 'Look for retention / discount offers before saying yes' },
  { id: 'cancel', text: 'Actually cancel the service' },
  { id: 'confirmation', text: 'Get confirmation email or confirmation number' },
  { id: 'reminder', text: 'Set a reminder to verify the charge actually stopped' },
  { id: 'verify', text: 'Check next month\'s statement to confirm it stopped' },
]

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
    case 'Easy': return '✅'
    case 'Medium': return '⚠️'
    case 'Hard': return '💀'
    case 'Very Hard': return '☠️'
    default: return '❓'
  }
}

export function getGuideForSub(subName) {
  const name = subName?.toLowerCase() || ''
  const key = Object.keys(CANCELLATION_GUIDES).find(k => name.includes(k.toLowerCase()))
  return key ? CANCELLATION_GUIDES[key] : null
}
