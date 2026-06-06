const CACHE_NAME = 'subguard-v2'
const SHELL = ['/', '/index.html']

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  if (!e.request.url.startsWith(self.location.origin)) return
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => caches.match('/')))
  )
})

// ── Push Notifications ──────────────────────────────────────────────────────

self.addEventListener('push', e => {
  if (!e.data) return
  let data = {}
  try { data = e.data.json() } catch { data = { title: 'SubGuard', body: e.data.text() } }

  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'subguard',
    data: { url: data.url || '/', subId: data.subId, renewalDate: data.renewalDate, stage: data.stage },
    requireInteraction: true,
    actions: data.actions || [],
  }

  e.waitUntil(self.registration.showNotification(data.title || 'SubGuard', options))
})

// ── Notification Action Clicks ──────────────────────────────────────────────

self.addEventListener('notificationclick', e => {
  e.notification.close()
  const { action } = e
  const { url, subId, renewalDate, stage } = e.notification.data || {}

  // If user taps "Don't remind this cycle" on stage-1 notification
  if (action === 'dismiss-cycle' && subId && renewalDate) {
    // Post message to all clients so the app can update localStorage
    e.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
        list.forEach(client => client.postMessage({
          type: 'DISMISS_NOTIF_CYCLE',
          subId,
          renewalDate,
        }))
        // If no app open, open it to handle the dismiss
        if (!list.length) return clients.openWindow(`/?dismiss=${subId}_${renewalDate}`)
      })
    )
    return
  }

  // "Cancel subscription" — open cancellation center
  if (action === 'go-cancel') {
    e.waitUntil(clients.openWindow('/cancellation'))
    return
  }

  // "Keep" or notification body tap — open home
  const target = url || '/'
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(self.location.origin))
      if (existing) return existing.focus()
      return clients.openWindow(target)
    })
  )
})
