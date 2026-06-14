'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ADMIN_PIN, unlockAdmin } from '@/lib/admin'

export default function PinGate() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  function press(d: string) {
    const next = (pin + d).slice(0, 4)
    setError(false)
    setPin(next)
    if (next.length === 4) {
      setTimeout(() => {
        if (next === ADMIN_PIN) unlockAdmin()
        else { setError(true); setPin('') }
      }, 120)
    }
  }

  function borrar() { setError(false); setPin((p) => p.slice(0, -1)) }

  return (
    <div className="h-full flex flex-col items-center justify-center p-6" style={{ background: 'var(--bg-dark)' }}>
      <div className="w-full max-w-xs flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--gold)', color: 'var(--espresso)' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 className="font-serif font-bold text-2xl" style={{ color: '#FEF8F0' }}>Administración</h1>
        <p className="text-sm mb-7" style={{ color: error ? '#FCA5A5' : 'var(--gold)' }}>
          {error ? 'PIN incorrecto, intenta de nuevo' : 'Ingresa el PIN para continuar'}
        </p>

        {/* Indicadores */}
        <div className="flex gap-3 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="w-3.5 h-3.5 rounded-full transition-all" style={{ background: i < pin.length ? 'var(--gold)' : 'transparent', border: `2px solid ${i < pin.length ? 'var(--gold)' : 'rgba(201,169,110,0.4)'}` }} />
          ))}
        </div>

        {/* Teclado */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button key={d} onClick={() => press(d)} className="aspect-square rounded-2xl text-2xl font-semibold cursor-pointer transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#FEF8F0', border: '1px solid rgba(201,169,110,0.2)' }}>
              {d}
            </button>
          ))}
          <div />
          <button onClick={() => press('0')} className="aspect-square rounded-2xl text-2xl font-semibold cursor-pointer transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#FEF8F0', border: '1px solid rgba(201,169,110,0.2)' }}>0</button>
          <button onClick={borrar} className="aspect-square rounded-2xl flex items-center justify-center cursor-pointer transition-all active:scale-95"
            style={{ background: 'transparent', color: 'var(--gold)' }} aria-label="Borrar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" /><line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" /></svg>
          </button>
        </div>

        <Link href="/" className="mt-8 text-sm font-medium" style={{ color: 'rgba(254,248,240,0.5)' }}>← Volver a Operación</Link>
      </div>
    </div>
  )
}
