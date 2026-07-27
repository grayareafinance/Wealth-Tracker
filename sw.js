const CACHE_NAME = "grayarea-wealth-tracker-v3";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png"
];

// Save the core app files when the service worker is installed.
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES))
  );

  self.skipWaiting();
});

// Remove obsolete cache versions.
self.addEventListener("activate", event => {
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames =>
        Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))
        )
      )
  );

  self.clients.claim();
});

// Use the internet when available, then fall back to the cache.
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseCopy = response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseCopy);
        });

        return response;
      })
      .catch(() =>
        caches.match(event.request).then(cachedResponse => {
          return cachedResponse || caches.match("./index.html");
        })
      )
  );
});
