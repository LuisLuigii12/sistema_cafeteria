/* Valeria's Coffee — Service Worker
 * Objetivo: que la app instalada ABRA AL INSTANTE y de forma confiable,
 * aunque la WiFi del café esté lenta. Los datos (mesas, órdenes, ventas)
 * NUNCA se cachean: siempre se piden frescos a Supabase.
 *
 * Estrategia:
 *  - Navegaciones (abrir la app)  -> red primero con límite de 3s; si tarda
 *    o no hay señal, sirve la versión guardada al instante. La red sigue en
 *    segundo plano y actualiza el caché para la próxima.
 *  - Archivos estáticos (JS/CSS hasheados, fuentes, íconos) -> caché primero.
 *  - Todo lo demás (Supabase, RSC, etc.) -> directo a la red, sin cachear.
 */

const CACHE = 'valerias-v1'
const APP_SHELL = '/'
const PRECACHE = ['/', '/manifest.json', '/logo.png', '/icon-192.png', '/icon-512.png']
const PRECACHE_PATHS = new Set(PRECACHE)

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // addAll falla si una sola falta; las metemos una por una y toleramos errores.
      .then((cache) => Promise.allSettled(PRECACHE.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Abrir la app (documento HTML): red primero con tope de tiempo, luego caché.
  if (request.mode === 'navigate') {
    event.respondWith(navigationHandler(request))
    return
  }

  const sameOrigin = url.origin === self.location.origin
  const isNextStatic = sameOrigin && url.pathname.startsWith('/_next/static/')
  const isGoogleFont = url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com'
  const isPrecached = sameOrigin && PRECACHE_PATHS.has(url.pathname)

  // Estáticos inmutables y fuentes: caché primero (rapidísimo).
  if (isNextStatic || isGoogleFont || isPrecached) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Resto (Supabase, datos RSC, etc.): no intervenimos -> red normal y fresca.
})

async function navigationHandler(request) {
  const cache = await caches.open(CACHE)

  const fromNetwork = fetch(request)
    .then((res) => {
      // Guardamos la última copia buena para próximos arranques.
      if (res && res.status === 200) cache.put(request, res.clone())
      return res
    })
    .catch(() => null)

  const timeout = new Promise((resolve) => setTimeout(() => resolve('TIMEOUT'), 3000))
  const winner = await Promise.race([fromNetwork, timeout])

  if (winner && winner !== 'TIMEOUT') return winner

  // Tardó demasiado o no hubo red: servimos lo guardado al instante.
  const cached = (await cache.match(request)) || (await cache.match(APP_SHELL))
  if (cached) return cached

  // Sin caché todavía: esperamos lo que dé la red.
  return (await fromNetwork) || fetch(request)
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE)
  const cached = await cache.match(request)
  if (cached) return cached
  try {
    const res = await fetch(request)
    if (res && (res.status === 200 || res.type === 'opaque')) cache.put(request, res.clone())
    return res
  } catch {
    return cached || Response.error()
  }
}
