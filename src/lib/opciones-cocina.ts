import type { Extra } from '@/types'

export type TipoOpcionCocina = 'crepas' | 'huevo'

export interface GrupoIngrediente {
  nombre: string
  items: string[]
}

export const CREPA_GRUPOS: GrupoIngrediente[] = [
  { nombre: 'Untables',  items: ['Queso crema', 'Nutella', 'Cajeta', 'Mermelada de fresa', 'Lotus'] },
  { nombre: 'Toppings',  items: ['Oreo', 'Nuez', 'Galleta lotus', 'Almendras', 'Chispas de chocolate'] },
  { nombre: 'Fruta',     items: ['Fresa', 'Plátano', 'Kiwi', 'Mango', 'Durazno en almíbar', 'Cereza'] },
]

/** Ingredients that always cost +$10 regardless of slot position */
export const CREPA_PREMIUMS = ['Lotus']

export const CREPA_INCLUIDOS = 2
export const CREPA_PRECIO_EXTRA = 10

/** Products that open the cocina options modal */
export const OPCIONES_COCINA: Record<string, TipoOpcionCocina> = {
  'Crepas': 'crepas',
  'Chilaquiles Verdes con Pollo': 'huevo',
  'Chilaquiles Rojos con Pollo': 'huevo',
}

/**
 * Builds the extras array for Crepas.
 * - First CREPA_INCLUIDOS non-premium items → precio: 0
 * - Each additional non-premium item → precio: 10
 * - Premium items (Lotus) → precio: 10 always
 */
export function buildExtrasCrepa(seleccionados: string[]): Extra[] {
  const normales = seleccionados.filter(n => !CREPA_PREMIUMS.includes(n))
  const premiums = seleccionados.filter(n => CREPA_PREMIUMS.includes(n))
  return [
    ...normales.map((nombre, idx) => ({ nombre, precio: idx < CREPA_INCLUIDOS ? 0 : CREPA_PRECIO_EXTRA })),
    ...premiums.map(nombre => ({ nombre, precio: CREPA_PRECIO_EXTRA })),
  ]
}

/** Returns what cost an item would add if selected next */
export function costoSiSeAgrega(nombre: string, normalesYaElegidos: number): number {
  if (CREPA_PREMIUMS.includes(nombre)) return CREPA_PRECIO_EXTRA
  return normalesYaElegidos >= CREPA_INCLUIDOS ? CREPA_PRECIO_EXTRA : 0
}
