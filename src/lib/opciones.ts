import type { Extra, Producto, Variante } from '@/types'

/** Extras disponibles (lista fija para todos los productos con tamaño). */
export const EXTRAS: Extra[] = [
  { nombre: 'Leche de Almendras', precio: 15 },
  { nombre: 'Leche de Coco',      precio: 15 },
  { nombre: 'Leche Deslactosada', precio: 15 },
  { nombre: 'Leche Entera',       precio: 15 },
  { nombre: 'Leche Light',        precio: 15 },
  { nombre: 'Boba',               precio: 10 },
]

/** Precio unitario = tamaño (o precio base) + extras. */
export function precioUnitario(producto: Producto, variante?: Variante | null, extras: Extra[] = []): number {
  const base = Number(variante?.precio ?? producto.precio)
  return base + extras.reduce((s, e) => s + Number(e.precio), 0)
}

/** Texto que se guarda en notas: "Tamaño · Extra1, Extra2". Mismo formato al enviar y al editar. */
export function buildNotas(variante?: Variante | null, extras: Extra[] = []): string | null {
  const partes = [variante?.nombre, extras.map((e) => e.nombre).join(', ')].filter(Boolean)
  return partes.length > 0 ? partes.join(' · ') : null
}

/** Reconstruye { variante, extras } desde el texto de notas, usando las variantes del producto. */
export function parseNotas(
  notas: string | null | undefined,
  variantes: Variante[] = [],
): { variante: Variante | null; extras: Extra[] } {
  if (!notas) return { variante: null, extras: [] }
  const tokens = notas
    .split('·')
    .flatMap((p) => p.split(','))
    .map((t) => t.trim())
    .filter(Boolean)

  let variante: Variante | null = null
  const extras: Extra[] = []
  for (const t of tokens) {
    const v = variantes.find((v) => v.nombre === t)
    if (v && !variante) { variante = v; continue }
    const e = EXTRAS.find((e) => e.nombre === t)
    if (e && !extras.some((x) => x.nombre === e.nombre)) extras.push(e)
  }
  return { variante, extras }
}
