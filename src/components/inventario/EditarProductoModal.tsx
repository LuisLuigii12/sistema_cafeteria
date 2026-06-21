'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { temaCategoria, CategoriaIcon } from '@/components/shared/categoria'
import { formatMoney, formatPercent } from '@/lib/format'
import type { Producto, ProductoOpcion } from '@/types'

interface Props {
  producto: Producto
  onGuardar: (id: string, cambios: Partial<Producto>) => void
  onCerrar: () => void
}

function num(v: string, fallback = 0) {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : fallback
}

export default function EditarProductoModal({ producto, onGuardar, onCerrar }: Props) {
  const tema = temaCategoria(producto.categorias?.nombre)
  const [stock, setStock] = useState(String(producto.stock))
  const [stockMinimo, setStockMinimo] = useState(String(producto.stock_minimo))
  const [precio, setPrecio] = useState(String(producto.precio))
  const [costo, setCosto] = useState(String(producto.costo))
  const [disponible, setDisponible] = useState(producto.disponible)
  const [ingredientes, setIngredientes] = useState(producto.ingredientes ?? '')
  const [imagenUrl, setImagenUrl] = useState(producto.imagen_url ?? '')
  const [subiendoImagen, setSubiendoImagen] = useState(false)
  const [opciones, setOpciones] = useState<ProductoOpcion[]>([])
  const [nuevaOpcion, setNuevaOpcion] = useState('')

  useEffect(() => {
    let activo = true
    ;(async () => {
      const { data } = await supabase
        .from('producto_opciones')
        .select('*')
        .eq('producto_id', producto.id)
        .order('created_at')
      if (activo && data) setOpciones(data)
    })()
    return () => { activo = false }
  }, [producto.id])

  async function agregarOpcion() {
    const texto = nuevaOpcion.trim()
    if (!texto) return
    setNuevaOpcion('')
    const { data } = await supabase
      .from('producto_opciones')
      .insert({ producto_id: producto.id, texto })
      .select()
      .single()
    if (data) setOpciones((prev) => [...prev, data as ProductoOpcion])
  }

  async function quitarOpcion(id: string) {
    setOpciones((prev) => prev.filter((o) => o.id !== id))
    await supabase.from('producto_opciones').delete().eq('id', id)
  }

  const precioN = num(precio)
  const costoN = num(costo)
  const margen = precioN - costoN
  const margenPct = precioN > 0 ? margen / precioN : 0

  function reabastecer(n: number) {
    setStock((prev) => String(Math.max(0, num(prev) + n)))
  }

  async function subirImagen(file: File) {
    setSubiendoImagen(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${producto.id}.${ext}`
      const { error } = await supabase.storage
        .from('productos')
        .upload(path, file, { upsert: true, contentType: file.type })
      if (error) throw error
      const { data } = supabase.storage.from('productos').getPublicUrl(path)
      // Añadir cache-buster para que se refresque la imagen
      const url = `${data.publicUrl}?t=${Date.now()}`
      setImagenUrl(url)
      await supabase.from('productos').update({ imagen_url: url }).eq('id', producto.id)
    } catch (e) {
      alert('Error al subir imagen. Verifica que el bucket "productos" existe en Supabase Storage.')
      console.error(e)
    } finally {
      setSubiendoImagen(false)
    }
  }

  function guardar() {
    onGuardar(producto.id, {
      stock: Math.max(0, Math.round(num(stock))),
      stock_minimo: Math.max(0, Math.round(num(stockMinimo))),
      precio: Math.max(0, precioN),
      costo: Math.max(0, costoN),
      disponible,
      ingredientes: ingredientes.trim() || null,
      imagen_url: imagenUrl || null,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(28,10,0,0.55)' }}
      onClick={onCerrar}
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden animate-scale flex flex-col max-h-[90vh]"
        style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-lg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 flex items-center gap-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: tema.soft, color: tema.color }}>
            <CategoriaIcon categoria={producto.categorias?.nombre} size={24} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-serif font-bold text-lg truncate" style={{ color: 'var(--espresso)' }}>{producto.nombre}</h3>
            <p className="text-xs" style={{ color: tema.color }}>{producto.categorias?.nombre ?? 'Sin categoría'}</p>
          </div>
          <button onClick={onCerrar} className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--gold-soft)]" style={{ color: 'var(--text-muted)' }} aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
          {/* Imagen del producto */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Foto del producto
            </label>
            <label className="block cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) subirImagen(f) }}
              />
              <div
                className="relative w-full h-40 rounded-2xl overflow-hidden flex items-center justify-center transition-all"
                style={{ background: imagenUrl ? 'transparent' : tema.soft, border: `2px dashed ${imagenUrl ? 'var(--gold)' : tema.color}` }}
              >
                {subiendoImagen ? (
                  <div className="flex flex-col items-center gap-2">
                    <div style={{ width: 28, height: 28, border: '3px solid rgba(201,169,110,0.3)', borderTop: '3px solid var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Subiendo...</p>
                  </div>
                ) : imagenUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagenUrl} alt={producto.nombre} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(28,10,0,0.5)' }}>
                      <span className="text-sm font-bold" style={{ color: '#FEF8F0' }}>Cambiar foto</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2" style={{ color: tema.color }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                    <p className="text-xs font-semibold">Toca para agregar foto</p>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Reabastecer rápido */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Reabastecer</label>
            <div className="flex gap-2 mt-1.5">
              {[5, 10, 20, 50].map((n) => (
                <button
                  key={n}
                  onClick={() => reabastecer(n)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-colors"
                  style={{ background: 'var(--gold-soft)', color: 'var(--brown)' }}
                >
                  +{n}
                </button>
              ))}
            </div>
          </div>

          {/* Stock + minimo */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Existencias">
              <input type="number" inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value)} className="modal-input" />
            </Field>
            <Field label="Stock mínimo">
              <input type="number" inputMode="numeric" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} className="modal-input" />
            </Field>
          </div>

          {/* Precio + costo */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Precio de venta">
              <input type="number" inputMode="decimal" value={precio} onChange={(e) => setPrecio(e.target.value)} className="modal-input" />
            </Field>
            <Field label="Costo">
              <input type="number" inputMode="decimal" value={costo} onChange={(e) => setCosto(e.target.value)} className="modal-input" />
            </Field>
          </div>

          {/* Margen preview */}
          <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: 'var(--bg-card-soft)', border: '1px solid var(--border)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Ganancia por unidad</span>
            <span className="text-base font-bold tabular-nums" style={{ color: margen >= 0 ? '#15803D' : '#EF4444' }}>
              {formatMoney(margen)} · {formatPercent(margenPct)}
            </span>
          </div>

          {/* Disponible */}
          <button
            onClick={() => setDisponible((d) => !d)}
            className="w-full flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer transition-colors"
            style={{ background: 'var(--bg-card-soft)', border: '1px solid var(--border)' }}
          >
            <span className="text-sm font-medium" style={{ color: 'var(--espresso)' }}>Visible en el menú</span>
            <span className="w-11 h-6 rounded-full relative transition-colors" style={{ background: disponible ? 'var(--green)' : 'var(--border)' }}>
              <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: disponible ? '22px' : '2px' }} />
            </span>
          </button>

          {/* Indicaciones rápidas — deshabilitado: se guarda en producto_opciones pero el modal de pedido no las consume todavía
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-0.5" style={{ color: 'var(--text-muted)' }}>
              Indicaciones rápidas
            </label>
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
              Lo que se le puede agregar (aparece como chips al ordenar)
            </p>
            <div className="flex flex-wrap gap-1.5 mb-2.5 min-h-[2rem]">
              {opciones.length === 0 ? (
                <span className="text-xs italic" style={{ color: 'var(--text-muted)' }}>Aún no hay opciones. Agrega una abajo.</span>
              ) : (
                opciones.map((o) => (
                  <span key={o.id} className="flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--gold-soft)', color: 'var(--brown)' }}>
                    {o.texto}
                    <button onClick={() => quitarOpcion(o.id)} className="w-4 h-4 rounded-full flex items-center justify-center cursor-pointer hover:bg-black/10" aria-label={`Quitar ${o.texto}`}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                  </span>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={nuevaOpcion}
                onChange={(e) => setNuevaOpcion(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarOpcion() } }}
                placeholder="Ej: Extra queso"
                className="flex-1 px-3 py-2 rounded-xl text-sm outline-none focus:border-[var(--gold)]"
                style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--espresso)' }}
              />
              <button
                onClick={agregarOpcion}
                disabled={!nuevaOpcion.trim()}
                className="w-11 rounded-xl flex items-center justify-center cursor-pointer transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--gold)', color: 'var(--espresso)' }}
                aria-label="Agregar opción"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              </button>
            </div>
          </div>
          */}

          {/* Ingredientes — qué lleva (se ve en Cocina/Barra) */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-0.5" style={{ color: 'var(--text-muted)' }}>
              Ingredientes — qué lleva
            </label>
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
              Uno por línea. Se muestra en Cocina/Barra para quien prepara.
            </p>
            <textarea
              value={ingredientes}
              onChange={(e) => setIngredientes(e.target.value)}
              rows={6}
              placeholder={'Totopos\nSalsa verde\nPollo deshebrado\nCrema\nQueso fresco'}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none focus:border-[var(--gold)] resize-none"
              style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--espresso)' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 flex gap-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={onCerrar} className="flex-1 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-colors" style={{ background: 'var(--bg-card-soft)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            Cancelar
          </button>
          <button onClick={guardar} className="flex-1 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all hover:brightness-110 active:scale-[0.99]" style={{ background: 'var(--espresso)', color: '#FEF8F0', boxShadow: 'var(--shadow-md)' }}>
            Guardar cambios
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-input {
          width: 100%;
          padding: 0.6rem 0.75rem;
          border-radius: 0.75rem;
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--espresso);
          font-weight: 700;
          font-size: 0.95rem;
          outline: none;
        }
        .modal-input:focus {
          border-color: var(--gold);
        }
      `}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</label>
      {children}
    </div>
  )
}
