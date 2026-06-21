'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import TopNav from '@/components/shared/TopNav'
import MesaModal from '@/components/home/MesaModal'
import type { Mesa } from '@/types'

const ESTADO: Record<string, { label: string; bg: string; color: string }> = {
  libre:     { label: 'Disponible', bg: '#DCFCE7', color: '#15803D' },
  ocupada:   { label: 'Ocupada',    bg: '#FEF3E2', color: '#92400E' },
  por_pagar: { label: 'Por cobrar', bg: '#FEE2E2', color: '#B91C1C' },
}

export default function ConfigMesasPage() {
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<Mesa | null>(null)
  const [creando, setCreando] = useState(false)

  async function fetchMesas() {
    const { data } = await supabase.from('mesas').select('*').order('numero')
    if (data) setMesas(data)
    setLoading(false)
  }

  useEffect(() => { fetchMesas() }, [])

  const siguienteNumero = mesas.length ? Math.max(...mesas.map((m) => m.numero)) + 1 : 1

  function cerrarYRefrescar() {
    setEditando(null)
    setCreando(false)
    fetchMesas()
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin" style={{ background: 'var(--bg-cream)' }}>
      <TopNav />

      <main className="p-4 sm:p-6 max-w-5xl mx-auto">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: 'var(--espresso)' }}>
              Mesas
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 2 }}>
              Agrega, edita o elimina las mesas del local
            </p>
          </div>
          <button
            onClick={() => setCreando(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:brightness-105 active:scale-[0.98] flex-shrink-0"
            style={{ background: 'var(--espresso)', color: '#FEF8F0', boxShadow: 'var(--shadow-md)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            <span className="hidden sm:inline">Nueva mesa</span>
            <span className="sm:hidden">Mesa</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: '#E8D5BB' }} />
            ))}
          </div>
        ) : mesas.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <p>No hay mesas. Crea la primera con &quot;Nueva mesa&quot;.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {mesas.map((mesa) => {
              const e = ESTADO[mesa.estado] ?? ESTADO.libre
              return (
                <button
                  key={mesa.id}
                  onClick={() => setEditando(mesa)}
                  className="lift relative h-32 rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-1 cursor-pointer text-center"
                  style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}
                >
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600 }}>Mesa</span>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 700, color: 'var(--espresso)', lineHeight: 1 }}>
                    {mesa.numero}
                  </span>
                  <span className="text-[0.62rem] font-bold px-2 py-0.5 rounded-full mt-1" style={{ background: e.bg, color: e.color }}>
                    {e.label}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold mt-1.5" style={{ color: 'var(--gold)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                    Editar
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </main>

      {(editando || creando) && (
        <MesaModal
          mesa={editando}
          sugerenciaNumero={siguienteNumero}
          onGuardar={cerrarYRefrescar}
          onCerrar={() => { setEditando(null); setCreando(false) }}
        />
      )}
    </div>
  )
}
