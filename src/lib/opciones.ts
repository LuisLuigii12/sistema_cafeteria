import type { Extra, Producto, Variante } from '@/types'

/** Un grupo de opciones al ordenar (ej. "Leche", "Extras", "¿Caliente o frío?"). */
export type ModoGrupo = 'una' | 'varias'
export interface GrupoOpcion {
  titulo: string
  modo: ModoGrupo // 'una' = elegir una sola; 'varias' = varios agregados
  opciones: Extra[]
}

// ── Bloques reutilizables ───────────────────────────────
const GRUPO_LECHE: GrupoOpcion = {
  titulo: 'Leche',
  modo: 'una',
  opciones: [
    { nombre: 'Leche Entera', precio: 0 },
    { nombre: 'Leche Deslactosada', precio: 0 },
    { nombre: 'Leche Light', precio: 0 },
    { nombre: 'Leche de Almendras', precio: 15 },
    { nombre: 'Leche de Coco', precio: 15 },
  ],
}
const GRUPO_AZUCAR: GrupoOpcion = {
  titulo: 'Azúcar',
  modo: 'una',
  opciones: [
    { nombre: 'Azúcar Stevia', precio: 0 },
    { nombre: 'Azúcar Splenda', precio: 0 },
  ],
}
const BOBA: Extra = { nombre: 'Boba', precio: 10 }
const GRUPO_TEMPERATURA: GrupoOpcion = {
  titulo: '¿Caliente o frío?',
  modo: 'una',
  opciones: [
    { nombre: 'Caliente', precio: 0 },
    { nombre: 'Frío', precio: 0 },
  ],
}

// ── Opciones por categoría ──────────────────────────────
const POR_CATEGORIA: Record<string, GrupoOpcion[]> = {
  'Coffee Classics': [GRUPO_LECHE, GRUPO_AZUCAR],
  'Bebidas Frías': [GRUPO_LECHE],
  Frappes: [
    GRUPO_LECHE,
    { titulo: 'Extras', modo: 'varias', opciones: [BOBA, { nombre: 'Sin crema batida', precio: 0 }] },
  ],
  Tisanas: [GRUPO_TEMPERATURA, GRUPO_AZUCAR],
  Smoothies: [{ titulo: 'Extras', modo: 'varias', opciones: [BOBA] }],
  // 'Soda Italiana' y el resto: sin opciones extra
}

// ── Opciones por producto (anulan la de su categoría) ───
const EXTRAS_SMOOTHIE_FRUTA: GrupoOpcion = {
  titulo: 'Extras',
  modo: 'varias',
  opciones: [BOBA, { nombre: 'Tajín', precio: 0 }, { nombre: 'Chamoy', precio: 0 }],
}
const POR_PRODUCTO: Record<string, GrupoOpcion[]> = {
  'Smoothie Frutos Rojos': [EXTRAS_SMOOTHIE_FRUTA],
  'Smoothie Mango': [EXTRAS_SMOOTHIE_FRUTA],
}

/** Grupos de opciones que se muestran al ordenar un producto (por producto o por categoría). */
export function gruposDeOpciones(producto: Producto): GrupoOpcion[] {
  return POR_PRODUCTO[producto.nombre] ?? POR_CATEGORIA[producto.categorias?.nombre ?? ''] ?? []
}

// ── Precio / notas / parseo ─────────────────────────────
/** Precio unitario = tamaño (o precio base) + extras. */
export function precioUnitario(producto: Producto, variante?: Variante | null, extras: Extra[] = []): number {
  const base = Number(variante?.precio ?? producto.precio)
  return base + extras.reduce((s, e) => s + Number(e.precio), 0)
}

/** Texto que se guarda en notas: "Tamaño · Opción1, Opción2". Mismo formato al enviar y al editar. */
export function buildNotas(variante?: Variante | null, extras: Extra[] = []): string | null {
  const partes = [variante?.nombre, extras.map((e) => e.nombre).join(', ')].filter(Boolean)
  return partes.length > 0 ? partes.join(' · ') : null
}

/** Reconstruye { variante, extras } desde el texto de notas, según las opciones del producto. */
export function parseNotas(
  notas: string | null | undefined,
  producto: Producto,
): { variante: Variante | null; extras: Extra[] } {
  if (!notas) return { variante: null, extras: [] }
  const variantes = producto.variantes ?? []
  const opciones = gruposDeOpciones(producto).flatMap((g) => g.opciones)
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
    const e = opciones.find((o) => o.nombre === t)
    if (e && !extras.some((x) => x.nombre === e.nombre)) extras.push(e)
  }
  return { variante, extras }
}
