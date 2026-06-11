/* HACCP Pro service worker.
 *
 * Phase 1 scope: installability + an offline fallback for navigations and
 * cached static assets. Push notification handling is added in the alerts
 * phase. App data is intentionally NOT cached — compliance data must be live.
 */

const CACHE_NAME = "haccp-pro-static-v1";
const PRECACHE_URLS = ["/manifest.json", "/icons/icon.svg", "/icons/icon-maskable.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Cache-first for immutable Next.js build assets and precached files
  if (url.pathname.startsWith("/_next/static/") || PRECACHE_URLS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return response;
          })
      )
    );
  }
});

// Push handlers (wired up in the alerts phase)
self.addEventListener("push", (event) => {
  if (!event.data) return;
  try {
    const payload = event.data.json();
    event.waitUntil(
      self.registration.showNotification(payload.title || "HACCP Pro", {
        body: payload.body || "",
        icon: "/icons/icon.svg",
        data: { url: payload.url || "/dashboard" },
      })
    );
  } catch {
    // ignore malformed payloads
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard";
  event.waitUntil(self.clients.openWindow(url));
});
