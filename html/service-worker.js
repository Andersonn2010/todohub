// Name of our app's cache
const CACHE_NAME = "todohub-v6";

// Files we want to save for offline use
const FILES_TO_CACHE = [
    "./lesson-26-todo-app.html",
    "./manifest.webmanifest",
    "./todohub-logo.svg"
];

// Install event
self.addEventListener("install", function(event) {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(function() {
                return self.skipWaiting();
            })
    );

});

// Activate event
self.addEventListener("activate", function(event) {

    event.waitUntil(

        caches.keys().then(function(cacheNames) {

            return Promise.all(

                cacheNames.map(function(cacheName) {

                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }

                })

            );

        }).then(function() {

            return self.clients.claim();

        })

    );

});


// Fetch event
self.addEventListener("fetch", function(event) {

    // Only handle GET requests from our own website
    if (
        event.request.method !== "GET" ||
        new URL(event.request.url).origin !== self.location.origin
    ) {
        return;
    }

    event.respondWith(

        fetch(event.request, { cache: "no-store" })
            .then(function(response) {

                // Save successful network responses
                // into our current cache

                if (!response.ok || response.type !== "basic") {
                    return response;
                }

                return caches.open(CACHE_NAME)

                    .then(function(cache) {

                        return cache.put(
                            event.request,
                            response.clone()
                        );

                    })

                    .then(function() {

                        return response;

                    });

            })

            .catch(function() {

                // If offline, use the saved version

                return caches.match(event.request);

            })

    );

});
