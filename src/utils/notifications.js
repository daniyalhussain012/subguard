import { getDaysUntil, formatCurrency } from './storage'

const VAPID_PUBLIC_KEY = 'BAfGteonw39oJKjnw-i15dWF8RjDahPoHb_Qj6Wx1_2ZRimw5OhX4_8aBOHZXRvVl__8D7bIv_lpbpI9Thjx1nQ'
const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

let swRegistration = null

// ── Service Worker ──────────────────────────────────────────────────────────

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null
  try {
    swRegistration = await navigator.serviceWorker.register('/sw.js')
    return swRegistration
  } catch {
    return null
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return await Notification.requestPermission()
}

// ── Web Push Subscription ───────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export async function subscribeToPush() {
  try {
    const reg = swRegistration || await navigator.serviceWorker?.ready
    if (!reg) return null
    const existing = await reg.pushManager.getSubscription()
    if (existing) {
      await sendSubscriptionToServer(existing)
      return existing
    }
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })
    await sendSubscriptionToServer(sub)
    return sub
  } catch (e) {
    console.warn('Push subscription failed:', e.message)
    return null
  }
}

async function sendSubscriptionToServer(sub) {
  try {
    const token = localStorage.getItem('subguard_token')
    if (!token) return
    await fetch(`${API}/api/push-subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ subscription: sub.toJSON() }),
    })
  } catch {}
}

export async function unsubscribeFromPush() {
  try {
    const reg = swRegistration || await navigator.serviceWorker?.ready
    const sub = await reg?.pushManager?.getSubscription()
    if (sub) {
      await sub.unsubscribe()
      const token = localStorage.getItem('subguard_token')
      await fetch(`${API}/api/push-unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      })
    }
  } catch {}
}

export async function getPushSubscriptionStatus() {
  try {
    const reg = swRegistration || await navigator.serviceWorker?.ready
    const sub = await reg?.pushManager?.getSubscription()
    return !!sub
  } catch { return false }
}

// ── 3-Stage Notification State ──────────────────────────────────────────────
// Stored in localStorage as: subguard_notif_state
// Shape: { [subId_renewalDate]: { stage1Sent, stage1Dismissed, stage2Sent, stage3Sent } }

function getNotifState() {
  try { return JSON.parse(localStorage.getItem('subguard_notif_state') || '{}') } catch { return {} }
}

function setNotifState(state) {
  localStorage.setItem('subguard_notif_state', JSON.stringify(state))
}

export function dismissNotifStage1(subId, renewalDate) {
  const state = getNotifState()
  const key = `${subId}_${renewalDate}`
  state[key] = { ...state[key], stage1Dismissed: true }
  setNotifState(state)
}

function cleanStaleNotifState(subscriptions) {
  const state = getNotifState()
  const validKeys = new Set(subscriptions.map(s => `${s.id}_${s.nextBillingDate}`))
  setNotifState(Object.fromEntries(Object.entries(state).filter(([k]) => validKeys.has(k))))
}

// ── Send Notification ───────────────────────────────────────────────────────

export async function sendNotification(title, body, tag, actions = []) {
  if (Notification.permission !== 'granted') return
  try {
    const reg = swRegistration || await navigator.serviceWorker?.ready
    if (reg?.showNotification) {
      await reg.showNotification(title, {
        body,
        tag,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        actions,
        data: { tag },
        requireInteraction: actions.length > 0,
      })
    } else {
      new Notification(title, { body, tag, icon: '/icon-192.png' })
    }
  } catch {
    try { new Notification(title, { body, tag }) } catch {}
  }
}

// ── 3-Stage Renewal Check ───────────────────────────────────────────────────

export function checkAndSendNotifications(subscriptions, settings) {
  if (!settings?.notifications?.enabled) return
  if (Notification.permission !== 'granted') return

  const lastCheck = localStorage.getItem('subguard_last_notify_check')
  const todayStr = new Date().toDateString()
  if (lastCheck && new Date(lastCheck).toDateString() === todayStr) return
  localStorage.setItem('subguard_last_notify_check', new Date().toISOString())

  cleanStaleNotifState(subscriptions)
  const state = getNotifState()

  subscriptions.filter(s => s.status === 'Active').forEach(sub => {
    const days = getDaysUntil(sub.nextBillingDate)
    const key = `${sub.id}_${sub.nextBillingDate}`
    const entry = state[key] || {}

    // Stage 1 — 7 days before renewal
    if (days === 7 && !entry.stage1Sent) {
      sendNotification(
        `\u{1F514} ${sub.name} renews in 1 week`,
        `${formatCurrency(sub.amount)} will be charged on ${sub.nextBillingDate}. Open app to manage.`,
        `stage1-${key}`,
        [
          { action: 'keep-remind', title: 'Keep reminding me' },
          { action: 'dismiss-cycle', title: "Don't remind this cycle" },
        ]
      )
      state[key] = { ...entry, stage1Sent: true }
    }

    // Stage 2 — 2 days before (only if user did NOT dismiss stage 1)
    else if (days === 2 && !entry.stage2Sent && !entry.stage1Dismissed) {
      sendNotification(
        `⚠️ ${sub.name} renews in 2 days`,
        `${formatCurrency(sub.amount)} will be charged soon. Keep or cancel?`,
        `stage2-${key}`,
        [
          { action: 'keep', title: 'Keep subscription' },
          { action: 'go-cancel', title: 'Cancel it' },
        ]
      )
      state[key] = { ...entry, stage2Sent: true }
    }

    // Stage 3 — 1 day before (final warning, always fires)
    else if (days === 1 && !entry.stage3Sent) {
      sendNotification(
        `\u{1F6A8} Final reminder: ${sub.name} renews TOMORROW`,
        `${formatCurrency(sub.amount)} charges tomorrow. Last chance to cancel.`,
        `stage3-${key}`,
        [
          { action: 'keep', title: 'Keep it' },
          { action: 'go-cancel', title: 'Cancel now' },
        ]
      )
      state[key] = { ...entry, stage3Sent: true }
    }
  })

  setNotifState(state)
}

export function getNotificationBadgeCount(subscriptions, reminders) {
  let count = 0
  subscriptions.forEach(sub => {
    if (sub.status !== 'Active') return
    const days = getDaysUntil(sub.nextBillingDate)
    if (days >= 0 && days <= 7) count++
  })
  reminders.forEach(r => {
    const sub = subscriptions.find(s => s.id === r.subscriptionId)
    if (!sub) return
    const days = getDaysUntil(sub.nextBillingDate)
    if (days <= r.daysBefore) count++
  })
  return count
}
