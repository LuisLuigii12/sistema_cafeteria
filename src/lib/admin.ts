'use client'

import { useEffect, useState } from 'react'

// ⚠️ PIN de acceso a Administración. Cámbialo por el que quiera el dueño.
// Nota: es una protección sencilla del lado del cliente (evita que el personal
// entre por accidente). Para seguridad real se necesita login con Supabase Auth.
export const ADMIN_PIN = '1234'

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
