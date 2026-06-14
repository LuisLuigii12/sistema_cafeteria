'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import RecetaModal from './RecetaModal'
import type { Orden, TipoDestino } from '@/types'

interface Props {
  destino: TipoDestino
  titulo: string
  subtitulo: string
}

function minutos(fechaStr: string, ahora: number) {
  return Math.max(0, Math.floor((ahora - new Date(fechaStr).getTime()) / 60000))
}
function fmtTiempo(mins: number) {
  if (mins < 1) return '< 1 min'
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60), m = mins % 60
  return m === 0 ? `${h} h` : `${h} h ${m} m`
}
function urgencia(mins: number) {
  if (mins < 5) return '#22C55E'
  if (mins < 10) return '#F59E0B'
  return '#EF4444'
}

type RecetaSel = { nombre: string; ingredientes: string | null; preparacion: string | null }

export default function EstacionBoard({ destino, titulo, subtitulo }: Props) {
  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [loading, setLoading] = useState(true)
  const [ahora, setAhora] = useState(() => Date.now())
  const [sonido, setSonido] = useState(false)
  const [flash, setFlash] = useState(false)
  const [receta, setReceta] = useState<RecetaSel | null>(null)
  const [deshacer, setDeshacer] = useState<{ id: string; mesa?: number } | null>(null)
  const [recetas, setRecetas] = useState<Record<string, { ingredientes: string | null; preparacion: string | null }>>({})
  const prevIds = useRef<Set<string> | null>(null)
  const audioRef = useRef<AudioContext | null>(null)
  const sonidoRef = useRef(false)

  function beep() {
    if (!sonidoRef.current) return
    try {
      const ctx = audioRef.current ?? new AudioContext()
      audioRef.current = ctx
      if (ctx.state === 'suspended') ctx.resume()
      const tono = (freq: number, t0: number) => {
        const o = ctx.createOscillator(), g = ctx.createGain()
        o.connect(g); g.connect(ctx.destination)
        o.type = 'sine'; o.frequency.value = freq
        g.gain.setValueAtTime(0.0001, ctx.currentTime + t0)
        g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + t0 + 0.02)
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t0 + 0.35)
        o.start(ctx.currentTime + t0); o.stop(ctx.currentTime + t0 + 0.35)
      }
      tono(880, 0); tono(1175, 0.18)
    } catch { /* sin audio */ }
  }

  function alertaNueva() {
    setFlash(true)
    setTimeout(() => setFlash(false), 1400)
    beep()
  }

  async function fetchRecetas() {
    // Resiliente: si las columnas de receta aún no existen (migración 004
    // pendiente), simplemente no se muestran las recetas y la estación sigue.
    const { data, error } = await supabase.from('productos').select('id, ingredientes, preparacion')
    if (error || !data) return
    const map: Record<string, { ingredientes: string | null; preparacion: string | null }> = {}
    data.forEach((p: { id: string; ingredientes: string | null; preparacion: string | null }) => {
      map[p.id] = { ingredientes: p.ingredientes ?? null, preparacion: p.preparacion ?? null }
    })
    setRecetas(map)
  }

  async function fetchOrdenes() {
    const { data } = await supabase
      .from('ordenes')
      .select('*, mesas(numero), orden_items(*, productos(nombre))')
      .eq('destino', destino)
      .in('estado', ['pendiente', 'en_preparacion'])
      .order('created_at', { ascending: true })

    const lista = (data ?? []) as unknown as Orden[]
    const ids = new Set(lista.map((o) => o.id))
    if (prevIds.current && [...ids].some((id) => !prevIds.current!.has(id))) {
      alertaNueva()
    }
    prevIds.current = ids
    setOrdenes(lista)
    setLoading(false)
  }

  useEffect(() => {
    fetchOrdenes()
    fetchRecetas()
    const channel = supabase
      .channel(`estacion-${destino}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ordenes' }, fetchOrdenes)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orden_items' }, fetchOrdenes)
      .subscribe()
    const interval = setInterval(() => setAhora(Date.now()), 10000)
    return () => { supabase.removeChannel(channel); clearInterval(interval) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destino])

  function toggleSonido() {
    const nuevo = !sonido
    setSonido(nuevo)
    sonidoRef.current = nuevo
    if (nuevo) {
      try { audioRef.current = audioRef.current ?? new AudioContext(); audioRef.current.resume() } catch { /* */ }
    }
  }

  async function marcarListo(orden: Orden) {
    setOrdenes((prev) => prev.filter((o) => o.id !== orden.id))
    setDeshacer({ id: orden.id, mesa: orden.mesas?.numero })
    setTimeout(() => setDeshacer((d) => (d?.id === orden.id ? null : d)), 8000)
    await supabase.from('ordenes').update({ estado: 'listo' }).eq('id', orden.id)
  }

  async function deshacerListo() {
    if (!deshacer) return
    const id = deshacer.id
    setDeshacer(null)
    await supabase.from('ordenes').update({ estado: 'pendiente' }).eq('id', id)
    fetchOrdenes()
  }

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-dark)' }}>
      {/* Header */}
      <header
        className="flex-shrink-0 px-4 sm:px-6 py-3 flex items-center justify-between transition-colors duration-300"
        style={{ background: flash ? '#3D1F0A' : 'var(--espresso)', borderBottom: '2px solid var(--gold)' }}
      >
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center justify-center w-9 h-9 rounded-full transition-all hover:bg-white/10 flex-shrink-0" style={{ color: 'var(--gold)' }} aria-label="Volver">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          </Link>
          <div>
            <h1 style={{ color: '#FEF8F0', fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.1 }}>{titulo}</h1>
            <p style={{ color: 'var(--gold)', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{subtitulo}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          {/* Sonido */}
          <button
            onClick={toggleSonido}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            style={sonido ? { background: 'var(--gold)', color: 'var(--espresso)' } : { background: 'rgba(255,255,255,0.08)', color: 'var(--gold)' }}
            title="Sonido al entrar orden nueva"
          >
            {sonido ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
            )}
            <span className="hidden sm:inline">{sonido ? 'Sonido on' : 'Sonido off'}</span>
          </button>
          {/* Contador */}
          <div className="text-right">
            <p style={{ color: '#FEF8F0', fontSize: '1.5rem', fontWeight: 800, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{ordenes.length}</p>
            <p style={{ color: 'var(--gold)', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>en cola</p>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="flex items-center justify-center h-64"><p style={{ color: 'rgba(201,169,110,0.4)' }}>Cargando órdenes...</p></div>
        ) : ordenes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,169,110,0.08)', border: '2px dashed rgba(201,169,110,0.2)' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,110,0.4)" strokeWidth="1.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            </div>
            <p style={{ color: 'rgba(201,169,110,0.5)', fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 600 }}>Todo al día</p>
            <p style={{ color: 'rgba(254,248,240,0.25)', fontSize: '0.85rem' }}>Las órdenes nuevas aparecen aquí solas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {ordenes.map((orden) => {
              const mins = minutos(orden.created_at, ahora)
              const color = urgencia(mins)
              return (
                <div key={orden.id} className="rounded-2xl overflow-hidden flex flex-col animate-scale" style={{ background: '#1E0C02', border: `2px solid ${color}` }}>
                  <div style={{ height: 4, background: color }} />
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p style={{ color, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Mesa</p>
                        <h3 style={{ color: '#FEF8F0', fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>{orden.mesas?.numero}</h3>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: `${color}22`, color }}>{fmtTiempo(mins)}</span>
                    </div>

                    <div style={{ height: 1, background: `${color}30` }} />

                    {/* Items */}
                    <ul className="space-y-2 flex-1">
                      {orden.orden_items?.map((item) => {
                        const rec = recetas[item.producto_id]
                        const tieneReceta = !!(rec?.ingredientes || rec?.preparacion)
                        return (
                          <li key={item.id} className="flex items-start gap-2.5">
                            <span className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: `${color}22`, color }}>{item.cantidad}</span>
                            <div className="flex-1 min-w-0">
                              <p style={{ color: '#FEF8F0', fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.3 }}>{item.productos?.nombre}</p>
                              {item.notas && <p style={{ color: 'var(--gold)', fontSize: '0.72rem', marginTop: 2, fontStyle: 'italic' }}>↳ {item.notas}</p>}
                            </div>
                            {tieneReceta && (
                              <button
                                onClick={() => setReceta({ nombre: item.productos!.nombre, ingredientes: rec?.ingredientes ?? null, preparacion: rec?.preparacion ?? null })}
                                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-white/10"
                                style={{ color: 'var(--gold)', border: '1px solid rgba(201,169,110,0.3)' }}
                                aria-label="Cómo se prepara"
                                title="¿Cómo se prepara?"
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
                              </button>
                            )}
                          </li>
                        )
                      })}
                    </ul>

                    {/* Listo */}
                    <button
                      onClick={() => marcarListo(orden)}
                      className="w-full py-3.5 rounded-xl font-bold text-base cursor-pointer transition-all hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2"
                      style={{ background: '#16A34A', color: '#F0FDF4' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                      Listo
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Undo toast */}
      {deshacer && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-full shadow-xl z-50" style={{ background: 'var(--espresso)', border: '1px solid var(--gold)' }}>
          <span className="text-sm font-medium" style={{ color: '#FEF8F0' }}>Mesa {deshacer.mesa} lista ✓</span>
          <button onClick={deshacerListo} className="text-sm font-bold cursor-pointer" style={{ color: 'var(--gold)' }}>Deshacer</button>
        </div>
      )}

      {receta && (
        <RecetaModal nombre={receta.nombre} ingredientes={receta.ingredientes} preparacion={receta.preparacion} onCerrar={() => setReceta(null)} />
      )}
    </div>
  )
}
