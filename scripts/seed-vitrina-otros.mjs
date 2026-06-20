/**
 * Agrega las categorías "Vitrina" y "Otros" a la sección cafetería.
 * Ejecutar: node scripts/seed-vitrina-otros.mjs
 */
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://rcbcevvfujsmjjibrecw.supabase.co',
  'sb_publishable_IcQHXBB6r9KQhDiZxCs17w__HzTvfU7'
)

// ── Obtener el orden máximo actual para agregar al final ──────────────────────
const { data: cats } = await sb.from('categorias').select('orden').order('orden', { ascending: false }).limit(1)
const ordenBase = (cats?.[0]?.orden ?? 7) + 1

// ── Insertar categorías ───────────────────────────────────────────────────────
console.log('📂 Creando categorías...')
const { data: nuevasCats, error: errCat } = await sb
  .from('categorias')
  .insert([
    { nombre: 'Vitrina',  orden: ordenBase,     icono: '🍰', tipo: 'cafeteria' },
    { nombre: 'Otros',    orden: ordenBase + 1, icono: '🥤', tipo: 'cafeteria' },
  ])
  .select()

if (errCat) { console.error('Error categorías:', errCat.message); process.exit(1) }

const catMap = Object.fromEntries(nuevasCats.map(c => [c.nombre, c.id]))
console.log(`  ✓ Vitrina (orden ${ordenBase}), Otros (orden ${ordenBase + 1})\n`)

// ── Productos Vitrina ─────────────────────────────────────────────────────────
const VITRINA = [
  { nombre: 'Lunch Box Cake',                  precio: 140 },
  { nombre: '3 Leches Canela',                 precio: 45  },
  { nombre: '3 Leches Durazno',                precio: 50  },
  { nombre: '3 Leches Fresa',                  precio: 50  },
  { nombre: '3 Leches Chocolate',              precio: 50  },
  { nombre: 'Vaso 3 Leches Choc/Vainilla',     precio: 60  },
  { nombre: 'Cupcakes',                         precio: 30  },
  { nombre: 'Galletas Rellenas',               precio: 45  },
  { nombre: 'Flan',                            precio: 45  },
  { nombre: 'Choco Flan',                      precio: 50  },
  { nombre: 'Cheesecake Lotus',                precio: 85  },
  { nombre: 'Cheesecake Frutos Rojos',         precio: 85  },
  { nombre: 'Cheesecake Tortuga',              precio: 85  },
  { nombre: 'Panqué de Zanahoria',             precio: 35  },
  { nombre: 'Panqué de Limón',                 precio: 40  },
  { nombre: 'Matilda',                         precio: 55  },
  { nombre: 'Pingüino',                        precio: 55  },
  { nombre: 'Beso de Ángel',                   precio: 55  },
  { nombre: 'Panqué de Elote',                 precio: 40  },
  { nombre: 'Carrot Cheesecake',               precio: 85  },
  { nombre: 'Salsa Artesanal',                 precio: 45  },
  { nombre: 'Roles de Canela',                 precio: 50  },
  { nombre: 'Charolita de Zanahoria',          precio: 50  },
  { nombre: 'Empanadas de Cajeta',             precio: 10  },
  { nombre: 'Obleas',                          precio: 80  },
  { nombre: 'Vela Chispa Chica',               precio: 35  },
  { nombre: 'Vela Chispa Grande',              precio: 45  },
]

// ── Productos Otros ───────────────────────────────────────────────────────────
const OTROS = [
  { nombre: 'Agua',  precio: 10 },
  { nombre: 'Soda',  precio: 30 },
]

// ── Insertar productos ────────────────────────────────────────────────────────
const toRow = (catId) => (p) => ({
  nombre:       p.nombre,
  precio:       p.precio,
  costo:        0,
  stock:        999,
  stock_minimo: 0,
  categoria_id: catId,
  disponible:   true,
  imagen_url:   null,
  descripcion:  null,
  ingredientes: null,
  preparacion:  null,
})

console.log('🍰 Insertando Vitrina...')
const { error: errV } = await sb.from('productos').insert(VITRINA.map(toRow(catMap['Vitrina'])))
if (errV) console.error('  ✗ Vitrina:', errV.message)
else console.log(`  ✓ ${VITRINA.length} productos`)

console.log('🥤 Insertando Otros...')
const { error: errO } = await sb.from('productos').insert(OTROS.map(toRow(catMap['Otros'])))
if (errO) console.error('  ✗ Otros:', errO.message)
else console.log(`  ✓ ${OTROS.length} productos`)

console.log(`\n✅ Listo: ${VITRINA.length + OTROS.length} productos en 2 categorías nuevas.`)
