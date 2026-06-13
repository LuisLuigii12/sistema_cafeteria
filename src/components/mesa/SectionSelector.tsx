import type { TipoDestino } from '@/types'

interface Props {
  seccion: TipoDestino
  onCambiar: (s: TipoDestino) => void
  countCafeteria: number
  countCocina: number
}

export default function SectionSelector({ seccion, onCambiar, countCafeteria, countCocina }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 p-4" style={{ background: '#1C0A00' }}>
      <button
        onClick={() => onCambiar('cafeteria')}
        className="relative flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-200"
        style={
          seccion === 'cafeteria'
            ? { background: '#C9A96E', boxShadow: '0 4px 16px rgba(201,169,110,0.4)' }
            : { background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(201,169,110,0.2)' }
        }
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: seccion === 'cafeteria' ? 'rgba(28,10,0,0.2)' : 'rgba(201,169,110,0.15)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={seccion === 'cafeteria' ? '#1C0A00' : '#C9A96E'}
            strokeWidth="2" strokeLinecap="round">
            <path d="M17 8h1a4 4 0 0 1 0 8h-1"/>
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
            <line x1="6" y1="2" x2="6" y2="4"/>
            <line x1="10" y1="2" x2="10" y2="4"/>
            <line x1="14" y1="2" x2="14" y2="4"/>
          </svg>
        </div>
        <div className="text-left">
          <p
            className="font-bold text-sm"
            style={{ color: seccion === 'cafeteria' ? '#1C0A00' : '#FEF8F0' }}
          >
            Cafetería
          </p>
          <p
            className="text-xs"
            style={{ color: seccion === 'cafeteria' ? 'rgba(28,10,0,0.6)' : 'rgba(254,248,240,0.4)' }}
          >
            Bebidas y café
          </p>
        </div>
        {countCafeteria > 0 && (
          <span
            className="absolute top-2 right-2 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
            style={{
              background: seccion === 'cafeteria' ? 'rgba(28,10,0,0.25)' : '#C9A96E',
              color: seccion === 'cafeteria' ? '#1C0A00' : '#1C0A00',
            }}
          >
            {countCafeteria}
          </span>
        )}
      </button>

      <button
        onClick={() => onCambiar('cocina')}
        className="relative flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-200"
        style={
          seccion === 'cocina'
            ? { background: '#C9A96E', boxShadow: '0 4px 16px rgba(201,169,110,0.4)' }
            : { background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(201,169,110,0.2)' }
        }
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: seccion === 'cocina' ? 'rgba(28,10,0,0.2)' : 'rgba(201,169,110,0.15)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={seccion === 'cocina' ? '#1C0A00' : '#C9A96E'}
            strokeWidth="2" strokeLinecap="round">
            <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
            <line x1="6" y1="17" x2="18" y2="17"/>
          </svg>
        </div>
        <div className="text-left">
          <p
            className="font-bold text-sm"
            style={{ color: seccion === 'cocina' ? '#1C0A00' : '#FEF8F0' }}
          >
            Cocina
          </p>
          <p
            className="text-xs"
            style={{ color: seccion === 'cocina' ? 'rgba(28,10,0,0.6)' : 'rgba(254,248,240,0.4)' }}
          >
            Comidas y platillos
          </p>
        </div>
        {countCocina > 0 && (
          <span
            className="absolute top-2 right-2 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
            style={{
              background: seccion === 'cocina' ? 'rgba(28,10,0,0.25)' : '#C9A96E',
              color: '#1C0A00',
            }}
          >
            {countCocina}
          </span>
        )}
      </button>
    </div>
  )
}
