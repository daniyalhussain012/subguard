import { getDaysUntil, formatCurrency } from './storage'

let swRegistration = null

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
  const result = await Notification.requestPermission()
  return result
}

export async function sendNotification(title, body, tag) {
  if (Notification.permission !== 'granted') return
  try {
    const reg = swRegistration || (await navigator.serviceWorker?.ready)
    if (reg?.showNotification) {
      await reg.showNotification(title, { body, tag, icon: '/icon.svg', badge: '/icon.svg' })
    } else {
      new Notification(title, { body, tag, icon: '/favicon.svg' })
    }
  } catch {
    try { new Notification(title, { body, tag, icon: '/favicon.svg' }) } catch {}
  }
}

export function checkAndSendNotifications(subscriptions, settings) {
  if (!settings?.notifications?.enabled) return
  if (Notification.permission !== 'granted') return

  const lastCheck = localStorage.getItem('subguard_last_notify_check')
  const lastCheckDate = lastCheck ? new Date(lastCheck).toDateString() : null
  const todayStr = new Date().toDateString()
  if (lastCheckDate === todayStr) return

  localStorage.setItem('subguard_last_notify_check', new Date().toISOString())

  const remindDays = settings.notifications.remindDaysBefore || [2, 7]

  subscriptions.filter(s => s.status === 'Active').forEach(sub => {
    const days = getDaysUntil(sub.nextBillingDate)

    if (remindDays.includes(days)) {
      const urgency = days <= 1 ? '🚨' : days <= 3 ? '⚠️' : '💡'
      const title = `${urgency} ${sub.name} renews ${days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`}`
      const body = `${formatCurrency(sub.amount)} will be charged. Tap to keep or cancel.`
      sendNotification(title, body, `renewal-${sub.id}-${days}`)
    }

    if (days === 0) {
      sendNotification(`💸 ${sub.name} charging today`, `${formatCurrency(sub.amount)} is being charged now.`, `charge-${sub.id}`)
    }
  })
}

export function getNotificationBadgeCount(subscriptions, reminders) {
  let count = 0
  subscriptions.forEach(sub => {
    if (sub.status !== 'Active') return
    const days = getDaysUntil(sub.nextBillingDate)
    if (days >= 0 && days <= 3) count++
  })
  reminders.forEach(r => {
    const sub = subscriptions.find(s => s.id === r.subscriptionId)
    if (!sub) return
    const days = getDaysUntil(sub.nextBillingDate)
    if (days <= r.daysBefore) count++
  })
  return count
}
