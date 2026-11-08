// CarCare / FleetSync service worker: enables PWA install and handles web push.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

// Network passthrough (required for installability); no aggressive caching to avoid
// serving a stale app shell. Offline caching can be layered on later.
self.addEventListener('fetch', () => {})

self.addEventListener('push', (event) => {
  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = { title: 'FleetSync', body: event.data ? event.data.text() : '' }
  }
  const title = payload.title || 'FleetSync'
  const options = {
    body: payload.body || '',
    icon: '/android-chrome-192x192.png',
    badge: '/favicon-32x32.png',
    data: { url: payload.url || '/client/my-fleet' },
    tag: payload.tag,
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/client/my-fleet'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes('/client/my-fleet') && 'focus' in client) return client.focus()
      }
      return self.clients.openWindow(url)
    }),
  )
})
