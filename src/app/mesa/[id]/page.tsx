'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import CategoryFilter from '@/components/mesa/CategoryFilter'
import MenuGrid from '@/components/mesa/MenuGrid'
import OrderSummary from '@/components/mesa/OrderSummary'
import type { Categoria, Producto, Mesa, ItemCarrito } from '@/types'

export default function MesaPage() {
  const params = useParams()
  const router = useRouter()
  const mesaId = params.id as string

  const [mesa, setMesa] = useState<Mesa | null>(null)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null)
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [enviando, setEnviando] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    async function cargarDatos() {
      const [{ data: mesaData }, { data: catData }, { data: prodData }] = await Promise.all([
        supabase.from('mesas').select('*').eq('id', mesaId).single(),
        supabase.from('categorias').select('*').order('orden'),
        supabase.from('productos').select('*, categorias(*)').eq('disponible', true).order('nombre'),
      ])

      if (mesaData) setMesa(mesaData)
      if (catData) setCategorias(catData)
      if (prodData) setProductos(prodData)
      setLoading(false)
    }

    cargarDatos()
  }, [mesaId])

  const productosFiltrados = categoriaActiva
    ? productos.filter((p) => p.categoria_id === categoriaActiva)
    : productos

  function mostrarToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const agregarAlCarrito = useCallback((producto: Producto) => {
    setCarrito((prev) => {
      const existe = prev.find((i) => i.producto.id === producto.id)
      if (existe) {
        return prev.map((i) =>
          i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
        )
      }
      return [...prev, { producto, cantidad: 1, notas: '' }]
    })
  }, [])

  const actualizarCantidad = useCallback((productoId: string, cantidad: number) => {
    if (cantidad <= 0) {
      setCarrito((prev) => prev.filter((i) => i.producto.id !== productoId))
    } else {
      setCarrito((prev) =>
        prev.map((i) => (i.producto.id === productoId ? { ...i, cantidad } : i))
      )
    }
  }, [])

  const actualizarNota = useCallback((productoId: string, nota: string) => {
    setCarrito((prev) =>
      prev.map((i) => (i.producto.id === productoId ? { ...i, notas: nota } : i))
    )
  }, [])

  async function enviarOrden() {
    if (carrito.length === 0 || !mesa) return
    setEnviando(true)

    try {
      const total = carrito.reduce((s, i) => s + i.producto.precio * i.cantidad, 0)

      const { data: orden, error: ordenError } = await supabase
        .from('ordenes')
        .insert({ mesa_id: mesaId, estado: 'pendiente', total })
        .select()
        .single()

      if (ordenError || !orden) throw ordenError

      const items = carrito.map((i) => ({
        orden_id: orden.id,
        producto_id: i.producto.id,
        cantidad: i.cantidad,
        precio_unitario: i.producto.precio,
        notas: i.notas || null,
      }))

      const { error: itemsError } = await supabase.from('orden_items').insert(items)
      if (itemsError) throw itemsError

      await supabase.from('mesas').update({ estado: 'ocupada' }).eq('id', mesaId)

      setCarrito([])
      mostrarToast('✅ Orden enviada a cocina')
    } catch {
      mostrarToast('❌ Error al enviar la orden')
    } finally {
      setEnviando(false)
    }
  }

  const estadoLabel = mesa?.estado === 'libre' ? 'Libre' : mesa?.estado === 'ocupada' ? 'Ocupada' : 'Por pagar'
  const estadoStyle =
    mesa?.estado === 'libre'
      ? { background: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7' }
      : mesa?.estado === 'ocupada'
      ? { background: '#FEF3E2', color: 'var(--brown)', border: '1px solid var(--gold)' }
      : { background: '#FFEBEE', color: '#C62828', border: '1px solid #EF9A9A' }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--bg-cream)' }}>
        <div className="text-center">
          <svg className="animate-spin mx-auto mb-3" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round">
            <path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
          </svg>
          <p style={{ color: 'var(--text-muted)' }}>Cargando menú...</p>
        </div>
      </div>
    )
  }

  if (!mesa) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--bg-cream)' }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: 'var(--text-muted)' }}>Mesa no encontrada</p>
          <button onClick={() => router.push('/')} className="font-medium cursor-pointer" style={{ color: 'var(--gold)' }}>
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg-cream)' }}>
      {/* Header */}
      <header
        className="px-4 py-3 flex items-center justify-between flex-shrink-0"
        style={{ background: 'var(--espresso)', borderBottom: '1px solid var(--gold)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center w-9 h-9 rounded-full cursor-pointer transition-all duration-200 min-h-[44px] min-w-[44px]"
            style={{ color: 'var(--gold)' }}
            aria-label="Volver"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <div>
            <h1 className="font-serif font-semibold" style={{ color: '#FEF8F0' }}>Mesa {mesa.numero}</h1>
            <p className="text-xs" style={{ color: 'var(--gold)' }}>{mesa.capacidad} personas</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full" style={estadoStyle}>
          {estadoLabel}
        </span>
      </header>

      <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, var(--gold), transparent)' }} />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Menu section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex-shrink-0">
            <CategoryFilter
              categorias={categorias}
              categoriaActiva={categoriaActiva}
              onChange={setCategoriaActiva}
            />
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin px-4 pb-4 pt-2">
            <MenuGrid
              productos={productosFiltrados}
              carrito={carrito}
              onAgregar={agregarAlCarrito}
            />
          </div>
        </div>

        {/* Order panel */}
        <div
          className="w-72 flex flex-col flex-shrink-0"
          style={{ background: '#FFFFFF', borderLeft: '1px solid var(--border)' }}
        >
          <div
            className="px-4 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <h2 className="font-serif font-semibold" style={{ color: 'var(--espresso)' }}>Orden actual</h2>
          </div>
          <OrderSummary
            carrito={carrito}
            mesaNumero={mesa.numero}
            enviando={enviando}
            onActualizar={actualizarCantidad}
            onActualizarNota={actualizarNota}
            onEnviar={enviarOrden}
            onLimpiar={() => setCarrito([])}
          />
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-sm font-semibold shadow-xl z-50"
          style={{ background: 'var(--espresso)', color: '#FEF8F0', border: '1px solid var(--gold)' }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
