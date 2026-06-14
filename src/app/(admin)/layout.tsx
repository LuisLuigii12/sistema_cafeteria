'use client'

import { useAdmin } from '@/lib/admin'
import PinGate from '@/components/admin/PinGate'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const unlocked = useAdmin()
  if (!unlocked) return <PinGate />
  return <>{children}</>
}
