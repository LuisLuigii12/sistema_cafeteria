'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import TopNav from '@/components/shared/TopNav'
import GastoModal from '@/components/finanzas/GastoModal'
import { formatMoney, formatMoneyShort, formatPercent } from '@/lib/format'
import type { Orden, Gasto, CategoriaGasto } from '@/types'

type Periodo = 'hoy' | '7d' | '30d' | 'todo'

const PERIODOS: { value: Periodo; label: string }[] = [
  { value: 'hoy', label: 'Hoy' },
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' },
  { value: 'todo', label: 'Todo' },
]

export default function FinanzasPage() {
  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [periodo, setPeriodo] = useState<Periodo>('7d')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)

  async function fetchTodo() {
    const [ordRes, gasRes] = await Promise.all([
      supabase
        .from('ordenes')
        .select('id, total, created_at, estado, orden_items(cantidad, precio_unitario, productos(nombre, costo))')
        .neq('estado', 'cancelado')
        .order('created_at', { ascending: false }),
      supabase.from('gastos').select('*').order('created_at', { ascending: false }),
    ])
    if (ordRes.data) setOrdenes(ordRes.data as unknown as Orden[])
    if (gasRes.data) setGastos(gasRes.data as Gasto[])
    setLoading(false)
  }

  useEffect(() => {
    fetchTodo()
    const channel = supabase
      .channel('finanzas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ordenes' }, fetchTodo)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gastos' }, fetchTodo)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const desde = useMemo(() => {
    const d = new Date()
    if (periodo === 'hoy') { d.setHours(0, 0, 0, 0); return d }
    if (periodo === '7d') { d.setDate(d.getDate() - 7); return d }
    if (periodo === '30d') { d.setDate(d.getDate() - 30); return d }
    return new Date(0)
  }, [periodo])

  const m = useMemo(() => {
    const ordP = ordenes.filter((o) => new Date(o.created_at) >= desde)
    const gasP = gastos.filter((g) => new Date(g.created_at) >= desde)

    const ingresos = ordP.reduce((s, o) => s + Number(o.total), 0)
    const cogs = ordP.reduce((s, o) =>
      s + (o.orden_items ?? []).reduce((si, it) => si + it.cantidad * Number(it.productos?.costo ?? 0), 0), 0)
    const gastosOp = gasP.reduce((s, g) => s + Number(g.monto), 0)
    const utilidadBruta = ingresos - cogs
    const utilidadNeta = utilidadBruta - gastosOp
    const margen = ingresos > 0 ? utilidadNeta / ingresos : 0

    // Top productos
    const mapa = new Map<string, { cantidad: number; ingreso: number }>()
    for (const o of ordP) {
      for (const it of o.orden_items ?? []) {
        const nombre = it.productos?.nombre ?? 'Producto'
        const cur = mapa.get(nombre) ?? { cantidad: 0, ingreso: 0 }
        cur.cantidad += it.cantidad
        cur.ingreso += it.cantidad * Number(it.precio_unitario)
        mapa.set(nombre, cur)
      }
    }
    const top = [...mapa.entries()].map(([nombre, v]) => ({ nombre, ...v })).sort((a, b) => b.ingreso - a.ingreso).slice(0, 5)

    return { ingresos, cogs, gastosOp, utilidadBruta, utilidadNeta, margen, top, numOrdenes: ordP.length }
  }, [ordenes, gastos, desde])

  // Tendencia: últimos 7 días (independiente del periodo)
  const dias = useMemo(() => {
    const out: { label: string; total: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i)
      const next = new Date(d); next.setDate(d.getDate() + 1)
      const total = ordenes
        .filter((o) => { const t = new Date(o.created_at); return t >= d && t < next })
        .reduce((s, o) => s + Number(o.total), 0)
      out.push({ label: d.toLocaleDateString('es-MX', { weekday: 'short' }), total })
    }
    return out
  }, [ordenes])
  const maxDia = Math.max(1, ...dias.map((d) => d.total))

  async function agregarGasto(g: { concepto: string; monto: number; categoria: CategoriaGasto }) {
    setModal(false)
    const { data } = await supabase.from('gastos').insert(g).select().single()
    if (data) setGastos((prev) => [data as Gasto, ...prev])
  }

  async function borrarGasto(id: string) {
    setGastos((prev) => prev.filter((g) => g.id !== id))
    await supabase.from('gastos').delete().eq('id', id)
  }

  const gastosVisibles = gastos.filter((g) => new Date(g.created_at) >= desde)

  // Breakdown robusto: el denominador es el mayor entre ingresos y egresos,
  // así la barra siempre suma ≤100% aunque haya pérdida.
  const egresos = m.cogs + m.gastosOp
  const denom = Math.max(1, m.ingresos, egresos)
  const fCogs = m.cogs / denom
  const fGastos = m.gastosOp / denom
  const fUtil = Math.max(0, m.ingresos - egresos) / denom

  const kpis = [
    { label: 'Ingresos', valor: m.ingresos, color: '#16A34A', sub: `${m.numOrdenes} ${m.numOrdenes === 1 ? 'orden' : 'órdenes'}` },
    { label: 'Costo de productos', valor: m.cogs, color: '#D97706', sub: 'lo que costó producir' },
    { label: 'Gastos operativos', valor: m.gastosOp, color: '#EF4444', sub: 'renta, sueldos, etc.' },
  ]

  return (
    <div className="h-full overflow-y-auto scrollbar-thin" style={{ background: 'var(--bg-cream)' }}>
      <TopNav />

      <main className="p-4 sm:p-6 max-w-6xl mx-auto">
        {/* Header + periodo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: 'var(--espresso)' }}>
              Finanzas
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 2 }}>
              Lo que entra, lo que sale y lo que ganas
            </p>
          </div>
          <div className="flex gap-1.5 p-1 rounded-xl self-start" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            {PERIODOS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriodo(p.value)}
                className="px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
                style={periodo === p.value ? { background: 'var(--espresso)', color: '#FEF8F0' } : { background: 'transparent', color: 'var(--text-muted)' }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4">
            <div className="h-32 rounded-3xl animate-pulse" style={{ background: '#E8D5BB' }} />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: '#E8D5BB' }} />)}
            </div>
          </div>
        ) : (
          <>
            {/* Utilidad neta — héroe (verde si ganas, rojo si pierdes) */}
            {(() => {
              const positiva = m.utilidadNeta >= 0
              const acento = positiva ? '#15803D' : '#DC2626'
              return (
                <div
                  className="rounded-3xl p-6 mb-4 animate-in"
                  style={{ background: positiva ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${positiva ? '#A7F3D0' : '#FECACA'}`, boxShadow: 'var(--shadow-md)' }}
                >
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
                    Utilidad neta
                  </p>
                  <p className="tabular-nums mt-1" style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.6rem', fontWeight: 800, color: acento, lineHeight: 1 }}>
                    {formatMoney(m.utilidadNeta)}
                  </p>
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Margen neto <strong style={{ color: acento }}>{formatPercent(m.margen)}</strong>
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Utilidad bruta <strong style={{ color: 'var(--espresso)' }}>{formatMoney(m.utilidadBruta)}</strong>
                    </span>
                  </div>

                  {/* Breakdown bar */}
                  <div className="mt-5">
                    <div className="flex h-3 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                      <div className="transition-all duration-500" style={{ width: `${fCogs * 100}%`, background: '#D97706' }} title="Costo de productos" />
                      <div className="transition-all duration-500" style={{ width: `${fGastos * 100}%`, background: '#EF4444' }} title="Gastos operativos" />
                      <div className="transition-all duration-500" style={{ width: `${fUtil * 100}%`, background: '#22C55E' }} title="Ganancia" />
                    </div>
                    <div className="flex gap-4 mt-2.5 flex-wrap">
                      <Leyenda color="#D97706" label="Costo productos" valor={formatMoney(m.cogs)} />
                      <Leyenda color="#EF4444" label="Gastos" valor={formatMoney(m.gastosOp)} />
                      <Leyenda color="#22C55E" label={positiva ? 'Ganancia' : 'Pérdida'} valor={formatMoney(Math.abs(m.utilidadNeta))} />
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
              {kpis.map((k, i) => (
                <div key={k.label} className="rounded-2xl p-5 animate-in" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)', animationDelay: `${i * 50}ms` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: k.color }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{k.label}</span>
                  </div>
                  <p className="tabular-nums" style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 800, color: 'var(--espresso)', lineHeight: 1 }}>
                    {formatMoney(k.valor)}
                  </p>
                  <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>{k.sub}</p>
                </div>
              ))}
            </div>

            {/* Chart + Top productos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {/* Ventas por día */}
              <div className="rounded-2xl p-5 animate-in" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--espresso)' }}>Ventas últimos 7 días</h3>
                <div className="flex items-end justify-between gap-2" style={{ height: 140 }}>
                  {dias.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <span className="text-[0.6rem] font-semibold tabular-nums" style={{ color: 'var(--text-muted)' }}>
                        {d.total > 0 ? formatMoneyShort(d.total) : ''}
                      </span>
                      <div
                        className="w-full rounded-t-lg transition-all duration-500"
                        style={{
                          height: `${Math.max(4, (d.total / maxDia) * 100)}%`,
                          background: d.total > 0 ? 'linear-gradient(to top, #C9A96E, #D4A853)' : 'var(--border-soft)',
                          minHeight: 4,
                        }}
                      />
                      <span className="text-[0.62rem] capitalize" style={{ color: 'var(--text-muted)' }}>{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top productos */}
              <div className="rounded-2xl p-5 animate-in" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--espresso)' }}>Productos más vendidos</h3>
                {m.top.length === 0 ? (
                  <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>Aún no hay ventas en este periodo</p>
                ) : (
                  <div className="space-y-3">
                    {m.top.map((t, i) => (
                      <div key={t.nombre} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'var(--gold-soft)', color: 'var(--brown)' }}>{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium truncate" style={{ color: 'var(--espresso)' }}>{t.nombre}</span>
                            <span className="text-sm font-bold tabular-nums flex-shrink-0" style={{ color: 'var(--espresso)' }}>{formatMoney(t.ingreso)}</span>
                          </div>
                          <div className="h-1.5 rounded-full mt-1 overflow-hidden" style={{ background: 'var(--border-soft)' }}>
                            <div className="h-full rounded-full" style={{ width: `${(t.ingreso / m.top[0].ingreso) * 100}%`, background: 'var(--gold)' }} />
                          </div>
                        </div>
                        <span className="text-xs tabular-nums flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{t.cantidad}u</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Gastos */}
            <div className="rounded-2xl p-5 animate-in" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm" style={{ color: 'var(--espresso)' }}>Gastos del periodo</h3>
                <button
                  onClick={() => setModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:brightness-105 active:scale-[0.98]"
                  style={{ background: 'var(--gold)', color: 'var(--espresso)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  Registrar gasto
                </button>
              </div>
              {gastosVisibles.length === 0 ? (
                <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>Sin gastos registrados en este periodo</p>
              ) : (
                <div className="space-y-2">
                  {gastosVisibles.map((g) => (
                    <div key={g.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl group" style={{ background: 'var(--bg-card-soft)' }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--espresso)' }}>{g.concepto}</p>
                        <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
                          {g.categoria} · {new Date(g.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <span className="text-sm font-bold tabular-nums" style={{ color: '#EF4444' }}>− {formatMoney(g.monto)}</span>
                      <button onClick={() => borrarGasto(g.id)} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-red-100 opacity-50 hover:opacity-100" style={{ color: '#EF4444' }} aria-label="Borrar gasto">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {modal && <GastoModal onGuardar={agregarGasto} onCerrar={() => setModal(false)} />}
    </div>
  )
}

function Leyenda({ color, label, valor }: { color: string; label: string; valor: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {label} <strong style={{ color: 'var(--espresso)' }}>{valor}</strong>
    </span>
  )
}
