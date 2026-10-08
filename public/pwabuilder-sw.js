// Keep this URL to retire workers installed before PWA support was removed.
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await caches.delete('paths.esm.dev-v1')
      await self.registration.unregister()
      const clients = await self.clients.matchAll({ type: 'window' })
      await Promise.all(clients.map((client) => client.navigate(client.url)))
    })()
  )
})
