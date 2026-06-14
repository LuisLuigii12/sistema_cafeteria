'use client'

import { useEffect } from 'react'
import { unlockAdmin } from '@/lib/admin'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Al entrar al área de Administración, activa el modo admin (sin PIN).
  useEffect(() => { unlockAdmin() }, [])
  return <>{children}</>
}
