import type { Producto } from '@/types'

/**
 * Indicaciones rápidas para la orden. Primero busca opciones específicas por
 * producto; si no hay, usa las de su categoría; y si no, un genérico.
 * Tocar un chip agrega/quita esa indicación sin escribir.
 */
const POR_PRODUCTO: Record<string, string[]> = {
  'Chilaquiles': ['Rojos', 'Verdes', 'Con pollo', 'Con huevo', 'Sin cebolla', 'Sin crema'],
  'Enfrijoladas': ['Con pollo', 'Con queso', 'Sin cebolla', 'Extra salsa'],
  'Huevos Revueltos': ['Con jamón', 'A la mexicana', 'Sin sal', 'Bien cocidos'],
  'Omelette': ['Con jamón', 'Con queso', 'Con champiñones', 'Sin cebolla'],
  'Hotcakes': ['Extra miel', 'Con mantequilla', 'Sin azúcar'],
  'Café Americano': ['Sin azúcar', 'Cargado', 'Descafeinado', 'Para llevar', 'Frío'],
  'Cappuccino': ['Sin azúcar', 'Deslactosada', 'Extra espuma', 'Canela', 'Para llevar'],
  'Latte': ['Sin azúcar', 'Deslactosada', 'Vainilla', 'Caramelo', 'Para llevar'],
  'Pollo a la Plancha': ['Sin sal', 'Bien cocido', 'Salsa aparte', 'Sin grasa'],
  'Ensalada César': ['Sin crutones', 'Aderezo aparte', 'Con pollo', 'Sin queso'],
  'Sandwich Club': ['Sin cebolla', 'Sin jitomate', 'Pan tostado', 'Papas aparte'],
}

const POR_CATEGORIA: Record<string, string[]> = {
  Bebidas: ['Sin azúcar', 'Para llevar', 'Caliente', 'Frío', 'Deslactosada'],
  Desayunos: ['Sin cebolla', 'Sin picante', 'Salsa aparte', 'Bien cocido'],
  Comidas: ['Sin cebolla', 'Sin picante', 'Salsa aparte', 'Sin sal'],
  Postres: ['Para llevar', 'Sin crema', 'Extra porción'],
  Snacks: ['Para llevar', 'Sin sal', 'Bien dorado'],
}

const GENERICO = ['Para llevar', 'Sin sal']

export function notasRapidas(producto: Producto): string[] {
  // 1) Opciones administradas en la base de datos (Inventario → editar producto)
  if (producto.producto_opciones && producto.producto_opciones.length > 0) {
    return producto.producto_opciones.map((o) => o.texto)
  }
  // 2) Respaldos por si aún no se configuran en la base de datos
  return POR_PRODUCTO[producto.nombre] ?? POR_CATEGORIA[producto.categorias?.nombre ?? ''] ?? GENERICO
}

function partes(nota: string): string[] {
  return nota.split(',').map((s) => s.trim()).filter(Boolean)
}

export function notaActiva(nota: string, chip: string): boolean {
  return partes(nota).some((p) => p.toLowerCase() === chip.toLowerCase())
}

/** Agrega el chip si no está, lo quita si ya está. Devuelve la nota resultante. */
export function alternarNota(nota: string, chip: string): string {
  const p = partes(nota)
  const i = p.findIndex((x) => x.toLowerCase() === chip.toLowerCase())
  if (i >= 0) p.splice(i, 1)
  else p.push(chip)
  return p.join(', ')
}
