const VERSION = '1.0.1'; // Версия для управления кэшами
const STATIC_CACHE = 'STATIC_CACHE-' + VERSION;
const MEDIA_CACHE = 'MEDIA_CACHE-' + VERSION;
const API_CACHE = 'API_CACHE-' + VERSION;

const STATIC_CACHE_EXPIRES = 60 * 60 * 24; // 24 часа
const MEDIA_CACHE_EXPIRES = 60 * 60 * 2; // 2 часа

const WORKER_HEADER = 'Worker-Cached-At';

const FIRST_ROUTES = [
    '^/$',
    '^/static/bundle.js$',
    '\.css$'
];

const CACHE_ON_INSTALL = [
    '/',
    '/index.html',
    '/bundle.js',
    '/styles/styles.css',
];

self.addEventListener('install', (event) => {
    console.log('Installing Service Worker', VERSION);

    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            return cache.addAll(CACHE_ON_INSTALL);
        })
    );

    (self as unknown as ServiceWorkerGlobalScope).skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Activating Service Worker', VERSION);

    // Удаляем старые кэши, если их версия не совпадает с текущей
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (
                        cacheName.includes('CACHE') &&
                        !cacheName.includes(VERSION)
                    ) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );

    // Новый сервис-воркер немедленно будет управлять клиентами
    const globalScope = self as unknown as ServiceWorkerGlobalScope;
    globalScope.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    if (event.request.mode === 'navigate') {
        console.log('nav');
        event.respondWith(
            fetch(event.request).catch(() =>
                caches.match('/index.html')
            )
        );
        return;
    }

    if (event.request.method === 'GET' && FIRST_ROUTES.some((regex) => url.pathname.match(regex))) {
        event.respondWith(handleRequestFirst(event.request));
    } else if (event.request.method === 'GET' && (url.pathname.startsWith('/static/') || (url.pathname.startsWith('/assets/')))) {
        event.respondWith(handleStaticFetch(event.request));
    } else if (event.request.method === 'GET' && url.pathname.startsWith('/minio/')) {
        event.respondWith(handleMediaFetch(event.request));
    // } else if (event.request.method === 'GET' && url.pathname.startsWith('/api/')) {
    //     event.respondWith(handleApiFetch(event.request));
    } else {
        event.respondWith(
            caches.match(event.request).then(response =>
                response || fetch(event.request)
            )
        );
    }
});

// Функция для проверки времени кэширования
function checkCachedResponse(response, expiry) {
    const headers = new Headers(response.headers);
    const cachedDate = new Date(headers.get(WORKER_HEADER));
    const ageInSeconds = (new Date().getTime() - cachedDate.getTime()) / 1000;
    return ageInSeconds < expiry;
}

// Клонируем ответ, чтобы сохранить его в кэш
function cloneResponse(response) {
    const responseToCache = response.clone();
    const headers = new Headers(responseToCache.headers);
    headers.set(WORKER_HEADER, new Date().toISOString());
    const responseWithDate = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers,
    });
    return responseWithDate;
}

// Обработка запросов с приоритетом кэширования
async function handleRequestFirst(request) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            await cache.put(request, cloneResponse(networkResponse));
            console.log('Updated cache after successful network request:', request.url);
        }

        return networkResponse;
    } catch (error) {
        console.warn('Network request failed, falling back to cache:', request.url);
        const cache = await caches.open(STATIC_CACHE);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// Обработка статичных ресурсов
async function handleStaticFetch(request) {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse && checkCachedResponse(cachedResponse, STATIC_CACHE_EXPIRES)) {
        console.log('Serving static content from cache:', request.url);
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            await cache.put(request, cloneResponse(networkResponse));
        }
        return networkResponse;
    } catch (error) {
        console.error('Failed to handle static fetch:', error);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// Обработка медиа-ресурсов
async function handleMediaFetch(request) {
    const cache = await caches.open(MEDIA_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse && checkCachedResponse(cachedResponse, MEDIA_CACHE_EXPIRES)) {
        console.log('Serving media content from cache:', request.url);
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            await cache.put(request, cloneResponse(networkResponse));
        }
        return networkResponse;
    } catch (error) {
        console.warn('Failed to handle media fetch:', error);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// Обработка API-запросов
async function handleApiFetch(request) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(API_CACHE);
            await cache.put(request, cloneResponse(networkResponse));
            console.log('Cached API response for offline use:', request.url);
        }

        return networkResponse;
    } catch (error) {
        console.warn('API network request failed, trying cache:', request.url);

        const cache = await caches.open(API_CACHE);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        throw error;
    }
}

