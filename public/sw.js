const CACHE_NAME = 'subguard-v3'

self.addEventListener('install', e => {
  e.waitUntil(self.skipWaiting())
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

  const url = new URL(e.request.url)

  // Navigation requests: ALWAYS fetch fresh from network so index.html is never stale.
  // This prevents blank pages when Vite bundle hashes change on each deploy.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then(c => c.put('/', clone))
          return res
        })
        .catch(() => caches.match('/') || caches.match('/index.html'))
    )
    return
  }

  // Content-hashed assets: cache-first (hash guarantees freshness)
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached
        return fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone))
          }
          return res
        })
      })
    )
    return
  }

  // Everything else: network-first
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  )
})

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

self.addEventListener('notificationclick', e => {
  e.notification.close()
  const { action } = e
  const { url, subId, renewalDate } = e.notification.data || {}
  if (action === 'dismiss-cycle' && subId && renewalDate) {
    e.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
        list.forEach(client => client.postMessage({ type: 'DISMISS_NOTIF_CYCLE', subId, renewalDate }))
        if (!list.length) return clients.openWindow('/?dismiss=' + subId + '_' + renewalDate)
      })
    )
    return
  }
  if (action === 'go-cancel') {
    e.waitUntil(clients.openWindow('/cancellation'))
    return
  }
  const target = url || '/'
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(self.location.origin))
      if (existing) return existing.focus()
      return clients.openWindow(target)
    })
  )
})
