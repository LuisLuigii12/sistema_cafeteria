'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const DIGITOS = ['1','2','3','4','5','6','7','8','9','','0','⌫']

export default function LoginPage() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (pin.length === 4) verificar(pin)
  }, [pin])

  async function verificar(value: string) {
    setLoading(true)
    setError(false)
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: value }),
    })
    if (res.ok) {
      router.replace('/')
    } else {
      setError(true)
      setLoading(false)
      setTimeout(() => { setPin(''); setError(false) }, 900)
    }
  }

  function presionar(d: string) {
    if (loading) return
    if (d === '⌫') { setPin(p => p.slice(0, -1)); setError(false); return }
    if (d === '') return
    if (pin.length < 4) setPin(p => p + d)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'linear-gradient(160deg, #1C0A00 0%, #2D1200 60%, #1C0A00 100%)' }}>

      {/* Logo */}
      <div className="mb-10 flex flex-col items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Valeria's Coffee" className="w-24 h-24 rounded-full object-contain"
          style={{ boxShadow: '0 0 40px rgba(201,169,110,0.3)' }} />
        <div className="text-center">
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 700, color: '#FEF8F0' }}>
            Valeria&apos;s Coffee
          </h1>
          <p style={{ color: 'var(--gold)', fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 4 }}>
            Punto de Venta
          </p>
        </div>
      </div>

      {/* Puntos PIN */}
      <div className="flex gap-4 mb-8">
        {[0,1,2,3].map(i => (
          <div key={i} className="w-4 h-4 rounded-full transition-all duration-150"
            style={{
              background: error
                ? '#EF4444'
                : i < pin.length
                  ? 'var(--gold)'
                  : 'rgba(201,169,110,0.25)',
              transform: i < pin.length ? 'scale(1.15)' : 'scale(1)',
              boxShadow: i < pin.length && !error ? '0 0 8px rgba(201,169,110,0.6)' : 'none',
            }} />
        ))}
      </div>

      {error && (
        <p className="text-sm font-medium mb-6 -mt-2" style={{ color: '#EF4444' }}>
          PIN incorrecto
        </p>
      )}

      {/* Teclado numérico */}
      <div className="grid grid-cols-3 gap-3 w-64">
        {DIGITOS.map((d, i) => (
          <button key={i} onClick={() => presionar(d)} disabled={loading || d === ''}
            className="h-16 rounded-2xl text-xl font-semibold transition-all active:scale-95"
            style={{
              background: d === '' ? 'transparent' : d === '⌫' ? 'rgba(201,169,110,0.12)' : 'rgba(254,248,240,0.08)',
              color: d === '⌫' ? 'var(--gold)' : '#FEF8F0',
              border: d === '' ? 'none' : '1px solid rgba(201,169,110,0.15)',
              cursor: d === '' ? 'default' : 'pointer',
              fontSize: d === '⌫' ? '1.5rem' : '1.4rem',
            }}>
            {d}
          </button>
        ))}
      </div>
    </div>
  )
}
