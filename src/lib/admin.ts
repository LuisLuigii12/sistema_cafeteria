'use client'

import { useEffect, useState } from 'react'

// Estado de "modo administración" (sin PIN). Se activa al entrar al área de
// Administración y se apaga con "Salir". Sirve para mostrar/ocultar controles
// de administración (ej. "Administrar mesas") en las pantallas de operación.
const KEY = 'admin_unlocked'
const EVENT = 'admin-change'

export function unlockAdmin() {
  sessionStorage.setItem(KEY, '1')
  window.dispatchEvent(new Event(EVENT))
}

export function lockAdmin() {
  sessionStorage.removeItem(KEY)
  window.dispatchEvent(new Event(EVENT))
}

/** Reactivo: true cuando Administración está desbloqueada en esta sesión. */
export function useAdmin(): boolean {
  const [unlocked, setUnlocked] = useState(false)

  useEffect(() => {
    const read = () => setUnlocked(sessionStorage.getItem(KEY) === '1')
    read()
    window.addEventListener(EVENT, read)
    return () => window.removeEventListener(EVENT, read)
  }, [])

  return unlocked
}
