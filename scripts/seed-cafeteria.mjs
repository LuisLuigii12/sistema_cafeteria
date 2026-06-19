/**
 * Limpia la BD y carga el menú real de Valeria's Coffee (sección Cafetería).
 * Requiere que la tabla `variantes` ya exista en Supabase.
 * Ejecutar: node scripts/seed-cafeteria.mjs
 */
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://rcbcevvfujsmjjibrecw.supabase.co',
  'sb_publishable_IcQHXBB6r9KQhDiZxCs17w__HzTvfU7'
)

// ── Datos del menú ────────────────────────────────────────────────────────────
// Cada producto puede tener un array `variantes` con {nombre, precio}.
// Si no tiene variantes, el precio base se usa directamente.

const MENU = {
  'Coffee Classics': [
    { nombre: 'Espresso',         precio: 30 },
    { nombre: 'Americano',        variantes: [{ nombre: 'Chico', precio: 50 }, { nombre: 'Grande', precio: 60 }] },
    { nombre: 'Americano c/Leche',variantes: [{ nombre: 'Chico', precio: 55 }, { nombre: 'Grande', precio: 65 }] },
    { nombre: 'Latte',            variantes: [{ nombre: 'Chico', precio: 60 }, { nombre: 'Grande', precio: 70 }] },
    { nombre: 'Cappuccino',       variantes: [{ nombre: 'Chico', precio: 55 }, { nombre: 'Grande', precio: 65 }] },
    { nombre: 'Cappuccino Francés',variantes: [{ nombre: 'Chico', precio: 60 }, { nombre: 'Grande', precio: 70 }] },
    { nombre: 'Macchiato',        variantes: [{ nombre: 'Chico', precio: 60 }, { nombre: 'Grande', precio: 70 }] },
    { nombre: 'Mocaccino',        variantes: [{ nombre: 'Chico', precio: 60 }, { nombre: 'Grande', precio: 70 }] },
    { nombre: 'Chai Latte',       variantes: [{ nombre: 'Chico', precio: 70 }, { nombre: 'Grande', precio: 80 }] },
    { nombre: 'Chocolate',        variantes: [{ nombre: 'Chico', precio: 55 }, { nombre: 'Grande', precio: 65 }] },
    { nombre: 'Taro',             variantes: [{ nombre: 'Chico', precio: 60 }, { nombre: 'Grande', precio: 70 }] },
    { nombre: 'Matcha',           variantes: [{ nombre: 'Chico', precio: 60 }, { nombre: 'Grande', precio: 70 }] },
  ],
  'Bebidas Frías': [
    { nombre: 'Chai Frío',        variantes: [{ nombre: 'Chico', precio: 65 }, { nombre: 'Mediano', precio: 75 }, { nombre: 'Grande', precio: 85 }] },
    { nombre: 'Dirty Chai',       variantes: [{ nombre: 'Chico', precio: 75 }, { nombre: 'Mediano', precio: 85 }, { nombre: 'Grande', precio: 95 }] },
    { nombre: 'Americano Frío',   variantes: [{ nombre: 'Chico', precio: 65 }, { nombre: 'Mediano', precio: 75 }, { nombre: 'Grande', precio: 85 }] },
    { nombre: 'Latte Regular',    variantes: [{ nombre: 'Chico', precio: 65 }, { nombre: 'Mediano', precio: 75 }, { nombre: 'Grande', precio: 85 }] },
    { nombre: 'Latte Vainilla',   variantes: [{ nombre: 'Chico', precio: 70 }, { nombre: 'Mediano', precio: 80 }, { nombre: 'Grande', precio: 90 }] },
    { nombre: 'Latte Caramelo',   variantes: [{ nombre: 'Chico', precio: 70 }, { nombre: 'Mediano', precio: 80 }, { nombre: 'Grande', precio: 90 }] },
    { nombre: 'Latte Avellana',   variantes: [{ nombre: 'Chico', precio: 70 }, { nombre: 'Mediano', precio: 80 }, { nombre: 'Grande', precio: 90 }] },
    { nombre: 'Latte Irlandesa',  variantes: [{ nombre: 'Chico', precio: 70 }, { nombre: 'Mediano', precio: 80 }, { nombre: 'Grande', precio: 90 }] },
    { nombre: 'Latte Lotus',      variantes: [{ nombre: 'Chico', precio: 75 }, { nombre: 'Mediano', precio: 85 }, { nombre: 'Grande', precio: 95 }] },
    { nombre: 'Caramel Macchiato',variantes: [{ nombre: 'Chico', precio: 75 }, { nombre: 'Mediano', precio: 85 }, { nombre: 'Grande', precio: 95 }] },
    { nombre: 'Latte Oreo',       variantes: [{ nombre: 'Chico', precio: 75 }, { nombre: 'Mediano', precio: 85 }, { nombre: 'Grande', precio: 95 }] },
    { nombre: 'Latte Lechera',    variantes: [{ nombre: 'Chico', precio: 70 }, { nombre: 'Mediano', precio: 80 }, { nombre: 'Grande', precio: 90 }] },
    { nombre: 'Matcha Frío',      variantes: [{ nombre: 'Chico', precio: 70 }, { nombre: 'Mediano', precio: 80 }, { nombre: 'Grande', precio: 90 }] },
    { nombre: 'Taro Frío',        variantes: [{ nombre: 'Chico', precio: 70 }, { nombre: 'Mediano', precio: 80 }, { nombre: 'Grande', precio: 90 }] },
    { nombre: 'Chocolate Frío',   variantes: [{ nombre: 'Chico', precio: 60 }, { nombre: 'Mediano', precio: 70 }, { nombre: 'Grande', precio: 80 }] },
    { nombre: 'Matcha Strawberry',variantes: [{ nombre: 'Chico', precio: 75 }, { nombre: 'Mediano', precio: 85 }, { nombre: 'Grande', precio: 95 }] },
  ],
  'Frappes': [
    { nombre: 'Frappé Regular Coffee',   variantes: [{ nombre: 'Chico', precio: 60 }, { nombre: 'Grande', precio: 70 }] },
    { nombre: 'Frappé Crema Avellana',   variantes: [{ nombre: 'Chico', precio: 60 }, { nombre: 'Grande', precio: 70 }] },
    { nombre: 'Frappé Chai',             variantes: [{ nombre: 'Chico', precio: 65 }, { nombre: 'Grande', precio: 75 }] },
    { nombre: 'Frappé Mazapán',          variantes: [{ nombre: 'Chico', precio: 65 }, { nombre: 'Grande', precio: 75 }] },
    { nombre: 'Frappé Matcha',           variantes: [{ nombre: 'Chico', precio: 65 }, { nombre: 'Grande', precio: 75 }] },
    { nombre: 'Frappé Oreo',             variantes: [{ nombre: 'Chico', precio: 65 }, { nombre: 'Grande', precio: 75 }] },
    { nombre: 'Frappé Caramelo',         variantes: [{ nombre: 'Chico', precio: 65 }, { nombre: 'Grande', precio: 75 }] },
    { nombre: 'Frappé Fresas con Crema', variantes: [{ nombre: 'Chico', precio: 70 }, { nombre: 'Grande', precio: 80 }] },
    { nombre: 'Frappé Frutos Rojos',     variantes: [{ nombre: 'Chico', precio: 70 }, { nombre: 'Grande', precio: 80 }] },
    { nombre: 'Frappé Pistache',         variantes: [{ nombre: 'Chico', precio: 65 }, { nombre: 'Grande', precio: 75 }] },
    { nombre: 'Frappé Moka',             variantes: [{ nombre: 'Chico', precio: 65 }, { nombre: 'Grande', precio: 75 }] },
    { nombre: 'Frappé Lotus',            variantes: [{ nombre: 'Chico', precio: 75 }, { nombre: 'Grande', precio: 85 }] },
    { nombre: 'Frappé Taro',             variantes: [{ nombre: 'Chico', precio: 65 }, { nombre: 'Grande', precio: 75 }] },
  ],
  'Tisanas': [
    { nombre: 'Tisana Fresa Kiwi',   variantes: [{ nombre: 'Chico', precio: 60 }, { nombre: 'Mediano', precio: 70 }, { nombre: 'Grande', precio: 80 }] },
    { nombre: 'Tisana Ponche',        variantes: [{ nombre: 'Chico', precio: 60 }, { nombre: 'Mediano', precio: 70 }, { nombre: 'Grande', precio: 80 }] },
    { nombre: 'Tisana Moras',         variantes: [{ nombre: 'Chico', precio: 60 }, { nombre: 'Mediano', precio: 70 }, { nombre: 'Grande', precio: 80 }] },
    { nombre: 'Tisana Cereza',        variantes: [{ nombre: 'Chico', precio: 60 }, { nombre: 'Mediano', precio: 70 }, { nombre: 'Grande', precio: 80 }] },
    { nombre: 'Tisana Fruta Pasión',  variantes: [{ nombre: 'Chico', precio: 60 }, { nombre: 'Mediano', precio: 70 }, { nombre: 'Grande', precio: 80 }] },
  ],
  'Soda Italiana': [
    { nombre: 'Soda Manzana Verde', variantes: [{ nombre: 'Chico', precio: 60 }, { nombre: 'Mediano', precio: 70 }, { nombre: 'Grande', precio: 80 }] },
    { nombre: 'Soda Blueberry',     variantes: [{ nombre: 'Chico', precio: 60 }, { nombre: 'Mediano', precio: 70 }, { nombre: 'Grande', precio: 80 }] },
    { nombre: 'Soda Fresa',         variantes: [{ nombre: 'Chico', precio: 60 }, { nombre: 'Mediano', precio: 70 }, { nombre: 'Grande', precio: 80 }] },
  ],
  'Smoothies': [
    { nombre: 'Smoothie Mango',       variantes: [{ nombre: 'Chico', precio: 75 }, { nombre: 'Grande', precio: 85 }] },
    { nombre: 'Smoothie Fresa',       variantes: [{ nombre: 'Chico', precio: 75 }, { nombre: 'Grande', precio: 85 }] },
    { nombre: 'Smoothie Frutos Rojos',variantes: [{ nombre: 'Chico', precio: 75 }, { nombre: 'Grande', precio: 85 }] },
  ],
  'Extras': [
    { nombre: 'Leche de Almendras', precio: 15 },
    { nombre: 'Leche de Coco',      precio: 15 },
    { nombre: 'Boba',               precio: 10 },
  ],
}

const ICONOS = {
  'Coffee Classics': '☕',
  'Bebidas Frías':   '🧊',
  'Frappes':         '🥤',
  'Tisanas':         '🫖',
  'Soda Italiana':   '🍋',
  'Smoothies':       '🥭',
  'Extras':          '✨',
}

// ── 1. Limpiar BD ─────────────────────────────────────────────────────────────
console.log('🧹 Limpiando datos de ejemplo...')

const VOID = '00000000-0000-0000-0000-000000000000'
await sb.from('producto_opciones').delete().neq('id', VOID)
await sb.from('variantes').delete().neq('id', VOID)
await sb.from('orden_items').delete().neq('id', VOID)
await sb.from('ordenes').delete().neq('id', VOID)
await sb.from('productos').delete().neq('id', VOID)
await sb.from('categorias').delete().neq('id', VOID)
await sb.from('mesas').update({ estado: 'libre' }).neq('id', VOID)
console.log('  ✓ BD limpia\n')

// ── 2. Insertar categorías ────────────────────────────────────────────────────
console.log('📂 Creando categorías...')
const { data: catsInsertadas, error: errCat } = await sb
  .from('categorias')
  .insert(
    Object.keys(MENU).map((nombre, i) => ({
      nombre,
      orden: i + 1,
      icono: ICONOS[nombre] ?? null,
      tipo: 'cafeteria',
    }))
  )
  .select()

if (errCat) { console.error('Error categorías:', errCat); process.exit(1) }
const catMap = Object.fromEntries(catsInsertadas.map(c => [c.nombre, c.id]))
console.log(`  ✓ ${catsInsertadas.length} categorías\n`)

// ── 3. Insertar productos y variantes ─────────────────────────────────────────
console.log('🍵 Insertando productos...')
let totalProductos = 0
let totalVariantes = 0

for (const [catNombre, items] of Object.entries(MENU)) {
  const catId = catMap[catNombre]

  // Precio base = precio fijo o menor variante
  const rows = items.map(p => ({
    nombre:       p.nombre,
    precio:       p.precio ?? (p.variantes?.[0]?.precio ?? 0),
    costo:        0,
    stock:        999,
    stock_minimo: 0,
    categoria_id: catId,
    disponible:   true,
    imagen_url:   null,
    descripcion:  null,
    ingredientes: null,
    preparacion:  null,
  }))

  const { data: insertados, error } = await sb.from('productos').insert(rows).select('id, nombre')
  if (error) { console.error(`  ✗ ${catNombre}:`, error.message); continue }

  totalProductos += insertados.length

  // Insertar variantes de los productos que las tienen
  const variantesRows = []
  for (const prod of items) {
    if (!prod.variantes) continue
    const dbProd = insertados.find(p => p.nombre === prod.nombre)
    if (!dbProd) continue
    prod.variantes.forEach((v, idx) => {
      variantesRows.push({ producto_id: dbProd.id, nombre: v.nombre, precio: v.precio, orden: idx })
    })
  }

  if (variantesRows.length > 0) {
    const { error: errV } = await sb.from('variantes').insert(variantesRows)
    if (errV) { console.error(`  ✗ variantes ${catNombre}:`, errV.message); continue }
    totalVariantes += variantesRows.length
  }

  const conVar = items.filter(p => p.variantes).length
  console.log(`  ✓ ${catNombre}: ${insertados.length} productos, ${variantesRows.length} variantes`)
}

console.log(`\n✅ Listo: ${totalProductos} productos, ${totalVariantes} variantes.`)
