const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css",
  "/index.js",
  "/indexedDb.js",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

const STATIC_CACHE = "static-cache-v1";
const DATA_CACHE = "data-cache-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(FILES_TO_CACHE))
  );

  // self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // const currentCaches = [STATIC_CACHE, DATA_CACHE];
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== STATIC_CACHE && key !== DATA_CACHE) {
            console.log("Removing stale cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", function (evt) {
  if (evt.request.url.includes("/api/")) {
    evt.respondWith(
      caches
        .open(DATA_CACHE)
        .then((cache) => {
          return fetch(evt.request)
            .then((response) => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }

              return response;
            })
            .catch((err) => {
              // Network request failed, try to get it from the cache.
              return cache.match(evt.request);
            });
        })
        .catch((err) => console.log(err))
    );

    return;
  }

  evt.respondWith(
    fetch(evt.request).catch(function () {
      return caches.match(evt.request).then(function (response) {
        if (response) {
          return response;
        } else if (evt.request.headers.get("accept").includes("text/html")) {
          return caches.match("/");
        }
      });
    })
  );
});
