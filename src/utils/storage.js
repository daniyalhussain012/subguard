import { v4 as uuidv4 } from 'uuid'
import { format, addDays, differenceInDays, addWeeks, addMonths, addYears, parseISO } from 'date-fns'

// ─── Keys ──────────────────────────────────────────────────────────────────
export const KEYS = {
  SUBSCRIPTIONS: 'subguard_subscriptions',
  REMINDERS: 'subguard_reminders',
  SETTINGS: 'subguard_settings',
  FIRST_VISIT: 'subguard_first_visit',
  HOUSEHOLD: 'subguard_household',
  SCAN_HISTORY: 'subguard_scan_history',
  ALERTS_DISMISSED: 'subguard_alerts_dismissed',
  CANCELLATIONS: 'subguard_cancellations',
  PRICE_HISTORY: 'subguard_price_history',
}

// ─── Migration from old subtracker_ keys ──────────────────────────────────
export function migrateFromOldKeys() {
  const oldPrefixes = ['subtracker_', 'subguard_old_']
  const keyNames = ['subscriptions', 'reminders', 'settings', 'first_visit', 'household', 'scan_history', 'alerts_dismissed', 'cancellations', 'price_history']
  keyNames.forEach(name => {
    const newKey = `subguard_${name}`
    if (localStorage.getItem(newKey)) return
    for (const prefix of oldPrefixes) {
      const oldData = localStorage.getItem(`${prefix}${name}`)
      if (oldData) {
        localStorage.setItem(newKey, oldData)
        localStorage.removeItem(`${prefix}${name}`)
        break
      }
    }
  })
}

// ─── Categories ───────────────────────────────────────────────────────────
export const CATEGORIES = [
  'Streaming', 'Music', 'Software', 'Gaming', 'Cloud Storage',
  'Fitness', 'News/Magazine', 'Food Delivery', 'Shopping',
  'Subscription Box', 'Recurring Donation', 'Installment Plan',
  'Bank Fee', 'App Store', 'Membership', 'Utilities',
  'Insurance', 'Phone/Internet', 'Other',
]

export const BILLING_CYCLES = ['Weekly', 'Monthly', 'Quarterly', 'Yearly']
export const STATUSES = ['Active', 'Paused', 'Cancelled', 'Under Review']
export const IMPORTANCE = ['Essential', 'Nice to Have', 'Can Live Without']

// Every category gets a visually distinct hue — no near-duplicates
// (the old palette had three purples, two reds, two blues, three grays)
export const CATEGORY_COLORS = {
  'Streaming': '#ef4444',          // bright red
  'Music': '#a855f7',              // purple
  'Software': '#3b82f6',           // blue
  'Gaming': '#f59e0b',             // amber
  'Cloud Storage': '#06b6d4',      // cyan
  'Fitness': '#22c55e',            // green
  'News/Magazine': '#f97316',      // orange
  'Food Delivery': '#ec4899',      // pink
  'Shopping': '#84cc16',           // lime
  'Subscription Box': '#d946ef',   // fuchsia
  'Recurring Donation': '#10b981', // emerald
  'Installment Plan': '#94a3b8',   // light slate
  'Bank Fee': '#be123c',           // dark crimson
  'App Store': '#6366f1',          // indigo
  'Membership': '#eab308',         // yellow
  'Utilities': '#78716c',          // warm stone
  'Insurance': '#0284c7',          // deep sky
  'Phone/Internet': '#7c3aed',     // violet
  'Other': '#6b7280',              // neutral gray
}

export const CATEGORY_ICONS = {
  'Streaming': '📺',
  'Music': '🎵',
  'Software': '💻',
  'Gaming': '🎮',
  'Cloud Storage': '☁️',
  'Fitness': '💪',
  'News/Magazine': '📰',
  'Food Delivery': '🍔',
  'Shopping': '🛍️',
  'Subscription Box': '📦',
  'Recurring Donation': '💝',
  'Installment Plan': '📱',
  'Bank Fee': '🏦',
  'App Store': '📲',
  'Membership': '🏆',
  'Utilities': '⚡',
  'Insurance': '🛡️',
  'Phone/Internet': '📡',
  'Other': '🔄',
}

export const AVATAR_OPTIONS = ['👤','👨','👩','👦','👧','🧑','👴','👵','🧔','👱','🧒','🐱']

export const FAMILY_ROLES = ['Me', 'Partner/Spouse', 'Child', 'Parent', 'Roommate', 'Other']

// ─── Sample Data ──────────────────────────────────────────────────────────
function makeDates() {
  const today = new Date()
  return [
    format(addDays(today, 2), 'yyyy-MM-dd'),   // urgent: Netflix
    format(addDays(today, 3), 'yyyy-MM-dd'),   // urgent: Spotify
    format(addDays(today, 7), 'yyyy-MM-dd'),
    format(addDays(today, 10), 'yyyy-MM-dd'),
    format(addDays(today, 14), 'yyyy-MM-dd'),
    format(addDays(today, 18), 'yyyy-MM-dd'),
    format(addDays(today, 22), 'yyyy-MM-dd'),
    format(addDays(today, 25), 'yyyy-MM-dd'),
    format(addDays(today, 6), 'yyyy-MM-dd'),
    format(addDays(today, 12), 'yyyy-MM-dd'),
    format(addDays(today, 20), 'yyyy-MM-dd'),
    format(addDays(today, 28), 'yyyy-MM-dd'),
  ]
}

export function buildSampleData() {
  const d = makeDates()
  const meId = uuidv4()
  const partnerId = uuidv4()
  const now = new Date().toISOString()
  const old30 = new Date(Date.now() - 40 * 86400000).toISOString()
  const old60 = new Date(Date.now() - 60 * 86400000).toISOString()

  const members = [
    { id: meId, name: 'Me', role: 'Me', avatar: '👤', createdAt: now },
    { id: partnerId, name: 'Partner', role: 'Partner/Spouse', avatar: '👤', createdAt: now },
  ]

  const sub = (overrides) => ({
    id: uuidv4(), autoRenewal: true, paymentMethod: 'Visa ending 4242',
    notes: '', canDowngrade: false, alternativeNotes: '', reminderDays: 3,
    createdAt: now, updatedAt: now, lastReviewedAt: now,
    usedBy: [], lastUsed: null, totalPaid: 0, monthsTracked: 1,
    decisionStatus: 'pending', snoozedUntil: null,
    isTrial: false, trialEndsDate: null, isPriceIncrease: false, originalPrice: null,
    cancellationChecklist: [], cancellationData: null,
    ...overrides,
  })

  const subscriptions = [
    sub({ name: 'Netflix', category: 'Streaming', amount: 15.49, billingCycle: 'Monthly', nextBillingDate: d[0], status: 'Active', importance: 'Essential', usedBy: [meId, partnerId], totalPaid: 185.88, monthsTracked: 12 }),
    sub({ name: 'Spotify', category: 'Music', amount: 10.99, billingCycle: 'Monthly', nextBillingDate: d[1], status: 'Active', importance: 'Nice to Have', usedBy: [meId], totalPaid: 131.88, monthsTracked: 12 }),
    sub({ name: 'Adobe Creative Cloud', category: 'Software', amount: 54.99, billingCycle: 'Monthly', nextBillingDate: d[2], status: 'Active', importance: 'Essential', usedBy: [meId], canDowngrade: true, alternativeNotes: 'Could downgrade to single-app plan', totalPaid: 659.88, monthsTracked: 12 }),
    sub({ name: 'ChatGPT Plus', category: 'Software', amount: 20.00, billingCycle: 'Monthly', nextBillingDate: d[3], status: 'Active', importance: 'Nice to Have', usedBy: [meId], paymentMethod: 'PayPal', totalPaid: 60, monthsTracked: 3 }),
    sub({ name: 'Amazon Prime', category: 'Shopping', amount: 14.99, billingCycle: 'Monthly', nextBillingDate: d[4], status: 'Active', importance: 'Nice to Have', usedBy: [meId, partnerId], notes: 'Includes Prime Video', totalPaid: 179.88, monthsTracked: 12 }),
    sub({ name: 'Planet Fitness', category: 'Fitness', amount: 24.99, billingCycle: 'Monthly', nextBillingDate: d[5], status: 'Paused', importance: 'Can Live Without', usedBy: [meId], paymentMethod: 'Mastercard ending 1234', lastReviewedAt: old30, totalPaid: 149.94, monthsTracked: 6 }),
    sub({ name: 'New York Times', category: 'News/Magazine', amount: 4.25, billingCycle: 'Monthly', nextBillingDate: d[6], status: 'Active', importance: 'Can Live Without', usedBy: [], lastReviewedAt: old60, lastUsed: 'cant_remember', totalPaid: 51, monthsTracked: 12 }),
    sub({ name: 'iCloud+', category: 'Cloud Storage', amount: 2.99, billingCycle: 'Monthly', nextBillingDate: d[7], status: 'Active', importance: 'Essential', usedBy: [meId], paymentMethod: 'Apple Pay', totalPaid: 35.88, monthsTracked: 12 }),
    sub({ name: 'HelloFresh', category: 'Subscription Box', amount: 59.99, billingCycle: 'Monthly', nextBillingDate: d[8], status: 'Active', importance: 'Nice to Have', usedBy: [meId, partnerId], notes: '4 meals/week plan', totalPaid: 119.98, monthsTracked: 2 }),
    sub({ name: 'Patreon (3 creators)', category: 'Recurring Donation', amount: 15.00, billingCycle: 'Monthly', nextBillingDate: d[9], status: 'Active', importance: 'Can Live Without', usedBy: [meId], totalPaid: 45, monthsTracked: 3 }),
    sub({ name: 'iPhone Installment', category: 'Installment Plan', amount: 41.62, billingCycle: 'Monthly', nextBillingDate: d[10], status: 'Active', importance: 'Essential', usedBy: [meId], paymentMethod: 'Carrier billing', notes: '18 months remaining', totalPaid: 249.72, monthsTracked: 6 }),
    sub({ name: 'Bank Maintenance Fee', category: 'Bank Fee', amount: 12.00, billingCycle: 'Monthly', nextBillingDate: d[11], status: 'Active', importance: 'Can Live Without', usedBy: [meId, partnerId], notes: 'Chase Premier Plus — waived if $15k balance', totalPaid: 144, monthsTracked: 12 }),
    // Sarah's separate Spotify (triggers duplicate alert)
    sub({ name: 'Spotify (Sarah)', category: 'Music', amount: 10.99, billingCycle: 'Monthly', nextBillingDate: format(addDays(new Date(), 15), 'yyyy-MM-dd'), status: 'Active', importance: 'Nice to Have', usedBy: [partnerId], notes: "Sarah's individual plan", totalPaid: 65.94, monthsTracked: 6 }),
  ]

  return { subscriptions, members }
}

// ─── Init ──────────────────────────────────────────────────────────────────
export function initData() {
  migrateFromOldKeys()
  if (!localStorage.getItem(KEYS.FIRST_VISIT)) {
    const { subscriptions, members } = buildSampleData()
    localStorage.setItem(KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions))
    localStorage.setItem(KEYS.REMINDERS, JSON.stringify([]))
    localStorage.setItem(KEYS.HOUSEHOLD, JSON.stringify(members))
    localStorage.setItem(KEYS.SCAN_HISTORY, JSON.stringify([]))
    localStorage.setItem(KEYS.ALERTS_DISMISSED, JSON.stringify([]))
    localStorage.setItem(KEYS.CANCELLATIONS, JSON.stringify([]))
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(defaultSettings()))
    localStorage.setItem(KEYS.FIRST_VISIT, 'done')
  }
}

export function defaultSettings() {
  return {
    darkMode: true,
    currency: 'USD',
    profile: { name: '', avatar: '👤' },
    notifications: {
      enabled: false,
      remindDaysBefore: [2, 7],
      renewalReminders: true,
      priceIncreaseAlerts: true,
      trialEndingAlerts: true,
      weeklySummary: true,
      monthlySavings: true,
      quietHoursStart: 22,
      quietHoursEnd: 8,
    },
    display: {
      compactView: false,
      showAmountsAs: 'monthly',
    },
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────
export function getMonthlyAmount(sub) {
  switch (sub.billingCycle) {
    case 'Weekly': return sub.amount * 4.33
    case 'Monthly': return sub.amount
    case 'Quarterly': return sub.amount / 3
    case 'Yearly': return sub.amount / 12
    default: return sub.amount
  }
}

export function getYearlyAmount(sub) {
  switch (sub.billingCycle) {
    case 'Weekly': return sub.amount * 52
    case 'Monthly': return sub.amount * 12
    case 'Quarterly': return sub.amount * 4
    case 'Yearly': return sub.amount
    default: return sub.amount * 12
  }
}

// All charge dates for a subscription within [rangeStart, rangeEnd].
// Auto-renewing subs repeat on their billing cycle indefinitely; non-renewing
// subs charge exactly once, on nextBillingDate. Occurrences are computed as
// offsets from the anchor date (not cumulatively) so month-end dates don't
// drift (e.g. Jan 31 → Feb 28 → Mar 31, not Mar 28).
export function getChargeDatesInRange(sub, rangeStart, rangeEnd) {
  if (!sub.nextBillingDate) return []
  const anchor = parseISO(sub.nextBillingDate.slice(0, 10))
  if (isNaN(anchor.getTime())) return []

  const renews = sub.autoRenewal !== false // older records lack the flag; renewal is the default
  if (!renews) return anchor >= rangeStart && anchor <= rangeEnd ? [anchor] : []

  const step = {
    Weekly:    (i) => addWeeks(anchor, i),
    Monthly:   (i) => addMonths(anchor, i),
    Quarterly: (i) => addMonths(anchor, i * 3),
    Yearly:    (i) => addYears(anchor, i),
  }[sub.billingCycle] || ((i) => addMonths(anchor, i))

  const dates = []
  for (let i = 0; i < 1200; i++) { // cap: ~23 years of weekly charges
    const d = step(i)
    if (d > rangeEnd) break
    if (d >= rangeStart) dates.push(d)
  }
  return dates
}

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount || 0)
}

export function getDaysUntil(dateStr) {
  if (!dateStr) return 999
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - today) / (1000 * 60 * 60 * 24))
}

export function formatDaysUntil(days) {
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days < 7) return `in ${days} days`
  if (days < 14) return 'in 1 week'
  if (days < 30) return `in ${Math.round(days / 7)} weeks`
  return `in ${Math.round(days / 30)} months`
}

export function getCountdown(dateStr) {
  if (!dateStr) return null
  const now = new Date()
  const target = new Date(dateStr)
  target.setHours(23, 59, 59, 0)
  const diff = target - now
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, expired: true }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return { days, hours, minutes, expired: false }
}

export function generateSmartAlerts(subscriptions, members) {
  const alerts = []
  const now = Date.now()

  subscriptions.forEach(sub => {
    if (sub.status !== 'Active') return
    const days = getDaysUntil(sub.nextBillingDate)
    const monthly = getMonthlyAmount(sub)

    // Annual renewal warning
    if (sub.billingCycle === 'Yearly' && days <= 14 && days >= 0) {
      alerts.push({
        id: `annual-${sub.id}`,
        type: 'warning',
        icon: '⚠️',
        subId: sub.id,
        message: `Annual charge: ${sub.name} renews in ${days} day${days !== 1 ? 's' : ''} — that's ${formatCurrency(sub.amount)} at once!`,
        action: 'Review',
      })
    }

    // Forgotten: active + can live without + not reviewed in 30d
    if (sub.importance === 'Can Live Without' && sub.lastReviewedAt) {
      const daysSinceReview = (now - new Date(sub.lastReviewedAt).getTime()) / 86400000
      if (daysSinceReview >= 30) {
        alerts.push({
          id: `forgotten-${sub.id}`,
          type: 'danger',
          icon: '💸',
          subId: sub.id,
          message: `You marked ${sub.name} as "Can Live Without" ${Math.round(daysSinceReview)} days ago but haven't cancelled yet`,
          action: 'Cancel Now',
        })
      }
    }

    // Last used: can't remember but still active
    if (sub.lastUsed === 'cant_remember' && sub.status === 'Active') {
      alerts.push({
        id: `unused-${sub.id}`,
        type: 'danger',
        icon: '🚨',
        subId: sub.id,
        message: `You said you can't remember using ${sub.name} — you're paying ${formatCurrency(monthly)}/mo for it`,
        action: 'Review',
      })
    }

    // Nobody using it
    if (sub.usedBy && sub.usedBy.length === 0 && members.length > 0) {
      alerts.push({
        id: `nobody-${sub.id}`,
        type: 'warning',
        icon: '👻',
        subId: sub.id,
        message: `Nobody in your household is tagged as using ${sub.name} (${formatCurrency(monthly)}/mo)`,
        action: 'Review',
      })
    }
  })

  // Duplicate detection: same category + similar amount
  const activeByName = {}
  subscriptions.filter(s => s.status === 'Active').forEach(s => {
    const key = s.name.toLowerCase().replace(/\s*\(.*\)/, '').trim()
    if (!activeByName[key]) activeByName[key] = []
    activeByName[key].push(s)
  })
  Object.values(activeByName).forEach(group => {
    if (group.length > 1) {
      const names = group.map(s => s.name).join(' + ')
      const total = group.reduce((sum, s) => sum + getMonthlyAmount(s), 0)
      alerts.push({
        id: `dup-${group.map(s => s.id).join('-')}`,
        type: 'info',
        icon: '👥',
        subId: group[0].id,
        message: `Possible duplicates: ${names} — total ${formatCurrency(total)}/mo. Consider a Family Plan?`,
        action: 'Compare',
      })
    }
  })

  return alerts.slice(0, 8)
}
