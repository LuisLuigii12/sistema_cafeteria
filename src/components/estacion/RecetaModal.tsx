'use client'

interface Props {
  nombre: string
  ingredientes: string | null
  onCerrar: () => void
}

function lineas(texto: string | null): string[] {
  if (!texto) return []
  return texto.split('\n').map((l) => l.replace(/^\s*\d+[.)]\s*/, '').trim()).filter(Boolean)
}

export default function RecetaModal({ nombre, ingredientes, onCerrar }: Props) {
  const ings = lineas(ingredientes)

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center sm:p-4"
      style={{ background: 'rgba(10,5,0,0.7)' }}
      onClick={onCerrar}
    >
      <div
        className="w-full sm:max-w-2xl sm:max-h-[92vh] overflow-y-auto scrollbar-thin sm:rounded-3xl flex flex-col"
        style={{ background: 'var(--bg-card)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 flex items-center justify-between sticky top-0 z-10" style={{ background: 'var(--espresso)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--gold)', color: 'var(--espresso)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
              </svg>
            </span>
            <div className="min-w-0">
              <p style={{ color: 'var(--gold)', fontSize: '0.65rem', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700 }}>Ingredientes</p>
              <h3 className="font-serif font-bold text-2xl truncate" style={{ color: '#FEF8F0' }}>{nombre}</h3>
            </div>
          </div>
          <button onClick={onCerrar} className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/10 flex-shrink-0" style={{ color: 'var(--gold)' }} aria-label="Cerrar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Ingredientes — grandes, visibles, sin interacción */}
        <div className="flex-1 p-5">
          {ings.length === 0 ? (
            <p className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
              Este producto no tiene ingredientes. Agrégalos en Inventario → editar producto.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ings.map((ing, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-4 rounded-2xl" style={{ background: 'var(--gold-soft)', border: '1px solid var(--border)' }}>
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: 'var(--gold)' }} />
                  <span className="text-lg font-bold leading-tight" style={{ color: 'var(--espresso)' }}>{ing}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 sticky bottom-0" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
          <button onClick={onCerrar} className="w-full py-3.5 rounded-xl font-bold text-base cursor-pointer transition-all hover:brightness-110 active:scale-[0.99]" style={{ background: 'var(--espresso)', color: '#FEF8F0' }}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
