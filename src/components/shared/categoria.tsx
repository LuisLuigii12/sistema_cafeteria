import type { ReactNode } from 'react'

/** Tema de color por categoría — cálidos, amigables, coherentes con la marca café. */
export interface CategoriaTheme {
  color: string
  soft: string
}

export const CATEGORIA_THEME: Record<string, CategoriaTheme> = {
  Desayunos: { color: '#E8924A', soft: '#FDF0DC' },
  Comidas:   { color: '#C66B3D', soft: '#F7E5DC' },
  Bebidas:   { color: '#A8743F', soft: '#F1E7DB' },
  Postres:   { color: '#D27D9E', soft: '#FAE7EE' },
  Snacks:    { color: '#7FA36B', soft: '#E9F0E4' },
}

export const CATEGORIA_THEME_DEFAULT: CategoriaTheme = { color: '#C9A96E', soft: '#FEF3E2' }

export function temaCategoria(nombre?: string | null): CategoriaTheme {
  return (nombre && CATEGORIA_THEME[nombre]) || CATEGORIA_THEME_DEFAULT
}

const PATHS: Record<string, ReactNode> = {
  Desayunos: (
    <>
      <path d="M12 22c6.23-.05 7.87-5.57 7.5-10-.36-4.34-3.95-9.96-7.5-10-3.55.04-7.14 5.66-7.5 10-.37 4.43 1.27 9.95 7.5 10z" />
      <circle cx="12" cy="13" r="2.5" />
    </>
  ),
  Comidas: (
    <>
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </>
  ),
  Bebidas: (
    <>
      <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </>
  ),
  Postres: (
    <>
      <path d="M12 2a3 3 0 0 0-3 3c0 1.5 1 2.6 2 3.4V10h2V8.4c1-.8 2-1.9 2-3.4a3 3 0 0 0-3-3z" />
      <rect x="3" y="10" width="18" height="12" rx="2" />
    </>
  ),
  Snacks: (
    <>
      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
      <path d="M8.5 8.5v.01" /><path d="M16 15.5v.01" /><path d="M12 12v.01" />
      <path d="M11 17v.01" /><path d="M7 14v.01" />
    </>
  ),
}

interface IconProps {
  categoria?: string | null
  size?: number
  className?: string
}

/** Icono representativo de la categoría (placeholder amigable hasta tener foto real). */
export function CategoriaIcon({ categoria, size = 24, className }: IconProps) {
  const path = (categoria && PATHS[categoria]) || PATHS.Bebidas
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {path}
    </svg>
  )
}
