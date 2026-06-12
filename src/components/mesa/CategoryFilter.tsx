import type { Categoria } from '@/types'

const CATEGORIA_ICONS: Record<string, React.ReactNode> = {
  'Bebidas': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
    </svg>
  ),
  'Desayunos': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 11l19-9-9 19-2-8-8-2z"/>
    </svg>
  ),
  'Comidas': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
    </svg>
  ),
  'Postres': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2a3 3 0 0 0-3 3c0 1.5 1 2.6 2 3.4V10h2V8.4c1-.8 2-1.9 2-3.4a3 3 0 0 0-3-3z"/><rect x="3" y="10" width="18" height="12" rx="2"/>
    </svg>
  ),
}

interface Props {
  categorias: Categoria[]
  categoriaActiva: string | null
  onChange: (id: string | null) => void
}

export default function CategoryFilter({ categorias, categoriaActiva, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
      <button
        onClick={() => onChange(null)}
        className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer min-h-[44px]"
        style={
          categoriaActiva === null
            ? { background: 'var(--espresso)', color: '#FEF8F0' }
            : { background: '#FFFFFF', color: 'var(--brown)', border: '1px solid var(--border)' }
        }
      >
        Todo
      </button>
      {categorias.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer min-h-[44px]"
          style={
            categoriaActiva === cat.id
              ? { background: 'var(--espresso)', color: '#FEF8F0' }
              : { background: '#FFFFFF', color: 'var(--brown)', border: '1px solid var(--border)' }
          }
        >
          {CATEGORIA_ICONS[cat.nombre] ?? null}
          {cat.nombre}
        </button>
      ))}
    </div>
  )
}
