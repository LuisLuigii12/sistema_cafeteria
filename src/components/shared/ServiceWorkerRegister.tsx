'use client'

import { useEffect } from 'react'

/**
 * Registra el service worker (public/sw.js) una vez que la app carga.
 * Esto hace que la PWA instalada abra al instante y de forma confiable.
 * No renderiza nada.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
    const register = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/', updateViaCache: 'none' })
        .catch((err) => console.warn('No se pudo registrar el service worker:', err))
    }
    // Esperamos a que la página termine de cargar para no competir por la red.
    if (document.readyState === 'complete') register()
    else window.addEventListener('load', register, { once: true })
  }, [])

  return null
}
