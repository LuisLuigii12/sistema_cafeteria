import type { Producto, ItemCarrito } from '@/types'

interface Props {
  productos: Producto[]
  carrito: ItemCarrito[]
  onAgregar: (producto: Producto) => void
}

export default function MenuGrid({ productos, carrito, onAgregar }: Props) {
  function cantidadEnCarrito(productoId: string) {
    return carrito.find((i) => i.producto.id === productoId)?.cantidad ?? 0
  }

  if (productos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64" style={{ color: 'var(--gold)' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="mb-2 opacity-50">
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/>
          <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
        </svg>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sin productos en esta categoría</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {productos.map((producto) => {
        const cantidad = cantidadEnCarrito(producto.id)
        const noDisponible = !producto.disponible
        const enCarrito = cantidad > 0

        return (
          <button
            key={producto.id}
            disabled={noDisponible}
            onClick={() => onAgregar(producto)}
            className="relative text-left p-4 rounded-2xl transition-all duration-200 cursor-pointer min-h-[44px]"
            style={
              noDisponible
                ? { background: '#F0EBE5', border: '2px solid var(--border)', opacity: 0.5, cursor: 'not-allowed' }
                : enCarrito
                ? { background: '#FEF3E2', border: '2px solid var(--gold)', boxShadow: '0 2px 8px rgba(201,169,110,0.25)' }
                : { background: '#FFFFFF', border: '2px solid var(--border)' }
            }
          >
            {enCarrito && (
              <span
                className="absolute top-2 right-2 w-6 h-6 text-xs font-bold rounded-full flex items-center justify-center"
                style={{ background: 'var(--gold)', color: 'var(--espresso)' }}
              >
                {cantidad}
              </span>
            )}

            <p className="font-semibold text-sm leading-tight pr-6" style={{ color: 'var(--espresso)' }}>
              {producto.nombre}
            </p>
            {producto.descripcion && (
              <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                {producto.descripcion}
              </p>
            )}
            <p className="mt-2 text-base font-bold" style={{ color: enCarrito ? 'var(--brown)' : 'var(--espresso)' }}>
              ${producto.precio.toFixed(2)}
            </p>
            {noDisponible && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>No disponible</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
