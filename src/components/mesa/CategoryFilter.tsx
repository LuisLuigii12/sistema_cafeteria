import type { Categoria } from '@/types'

interface Props {
  categorias: Categoria[]
  categoriaActiva: string | null
  onChange: (id: string | null) => void
}

export default function CategoryFilter({ categorias, categoriaActiva, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
      {categorias.map((cat) => {
        const activa = categoriaActiva === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer min-h-[44px] whitespace-nowrap"
            style={
              activa
                ? { background: 'var(--espresso)', color: '#FEF8F0', boxShadow: 'var(--shadow-sm)' }
                : { background: '#FFFFFF', color: 'var(--brown)', border: '1px solid var(--border)' }
            }
          >
            {cat.icono && <span style={{ fontSize: '1rem', lineHeight: 1 }}>{cat.icono}</span>}
            {cat.nombre}
          </button>
        )
      })}
    </div>
  )
}
