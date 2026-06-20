/**
 * Sube imágenes locales de public/imagenes/ a Supabase Storage
 * y actualiza imagen_url de todos los tamaños de cada producto.
 * Ejecutar: node scripts/set-imagenes-local.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const sb = createClient(
  'https://rcbcevvfujsmjjibrecw.supabase.co',
  'sb_publishable_IcQHXBB6r9KQhDiZxCs17w__HzTvfU7'
)

// archivo local (relativo a public/imagenes/)  →  nombre base del producto en BD
const MAPA = [
  // ── Coffee Classics ─────────────────────────────────────────────────
  ['Coffee Clasics/Americano Con leche.jpg', 'Americano c/Leche'],
  ['Coffee Clasics/Americano.jpg',           'Americano'],
  ['Coffee Clasics/Capuchino.jpg',           'Cappuccino'],
  ['Coffee Clasics/capuchino frances.jpg',   'Cappuccino Francés'],
  ['Coffee Clasics/Espresso.jpg',            'Espresso'],
  ['Coffee Clasics/Latte.jpg',               'Latte'],
  ['Coffee Clasics/Macchiato.jpg',           'Macchiato'],
  ['Coffee Clasics/Mocaccino.jpg',           'Mocaccino'],
  ['Coffee Clasics/Taro.jpg',                'Taro'],
  ['Coffee Clasics/chai latte.jpg',          'Chai Latte'],
  ['Coffee Clasics/chocolate.jpg',           'Chocolate'],
  ['Coffee Clasics/matcha.jpg',              'Matcha'],

  // ── Bebidas Frías ────────────────────────────────────────────────────
  ['Bebidas Frias/Americano Frio.jpg',       'Americano Frío'],
  ['Bebidas Frias/Caramel Machiatto.jpg',    'Caramel Macchiato'],
  ['Bebidas Frias/Dirty chai.jpg',           'Dirty Chai'],
  ['Bebidas Frias/Latte Caramelo.jpg',       'Latte Caramelo'],
  ['Bebidas Frias/latte avellana.jpg',       'Latte Avellana'],
  ['Bebidas Frias/Latte Irlandesa.jpg',      'Latte Irlandesa'],
  ['Bebidas Frias/Latte Lechera.jpg',        'Latte Lechera'],
  ['Bebidas Frias/Latte Lotus.jpg',          'Latte Lotus'],
  ['Bebidas Frias/Latte Oreo.jpg',           'Latte Oreo'],
  ['Bebidas Frias/Latte Regular.jpg',        'Latte Regular'],
  ['Bebidas Frias/Latte Vainilla.jpg',       'Latte Vainilla'],
  ['Bebidas Frias/chai frio.jpg',            'Chai Frío'],
  ['Bebidas Frias/chocolate frio.jpg',       'Chocolate Frío'],
  ['Bebidas Frias/matcha frio.jpg',          'Matcha Frío'],
  ['Bebidas Frias/matcha strawberry.jpg',    'Matcha Strawberry'],
  ['Bebidas Frias/Taro Frio.jpg',            'Taro Frío'],

  // ── Frappes ──────────────────────────────────────────────────────────
  ['Frappes/Frappe Caramelo.jpg',            'Frappé Caramelo'],
  ['Frappes/Frappe Chai.jpg',                'Frappé Chai'],
  ['Frappes/Frappe Crema Avellana.jpg',      'Frappé Crema Avellana'],
  ['Frappes/Frappe Fresas Con Crema.jpg',    'Frappé Fresas con Crema'],
  ['Frappes/Frappe Frutos Rojos.jpg',        'Frappé Frutos Rojos'],
  ['Frappes/Frappe Lotus.jpg',               'Frappé Lotus'],
  ['Frappes/Frappe Matcha.jpg',              'Frappé Matcha'],
  ['Frappes/Frappe Mazapan.jpg',             'Frappé Mazapán'],
  ['Frappes/Frappe Moka.jpg',                'Frappé Moka'],
  ['Frappes/Frappe Oreo.jpg',                'Frappé Oreo'],
  ['Frappes/Frappe Pistache.jpg',            'Frappé Pistache'],
  ['Frappes/Frappe Regular Coffee.jpg',      'Frappé Regular Coffee'],
  ['Frappes/Frappe Taro.jpg',                'Frappé Taro'],

  // ── Smoothies ────────────────────────────────────────────────────────
  ['Smooties/Smootie Fresa.jpg',             'Smoothie Fresa'],
  ['Smooties/Smootie Frutos Rojos.jpg',      'Smoothie Frutos Rojos'],
  ['Smooties/Smootie Mango.jpg',             'Smoothie Mango'],

  // ── Soda Italiana ────────────────────────────────────────────────────
  ['Soda Italiana/Soda Italiana BlueBerry.jpg', 'Soda Blueberry'],
  ['Soda Italiana/Soda Italiana Fresa.jpg',     'Soda Fresa'],
  ['Soda Italiana/Soda Italiana Manzana Verde.jpg', 'Soda Manzana Verde'],

  // ── Tisanas ──────────────────────────────────────────────────────────
  ['Tisanas/Tisana Cereza.jpg',              'Tisana Cereza'],
  ['Tisanas/Tisana Fresa Kiwi.jpg',          'Tisana Fresa Kiwi'],
  ['Tisanas/Tisana Moras.jpg',               'Tisana Moras'],
  ['Tisanas/Tisana fruta de la pasion.jpg',  'Tisana Fruta Pasión'],
  ['Tisanas/Tisana ponche.jpg',              'Tisana Ponche'],
]

// slug para nombre de archivo en Storage (sin acentos, sin caracteres especiales)
function slug(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Cargar todos los productos de la BD
const { data: productos, error: errProd } = await sb.from('productos').select('id, nombre')
if (errProd) { console.error('Error cargando productos:', errProd); process.exit(1) }

const BASE = resolve('public/imagenes')
const TAMANIOS = ['Chico', 'Mediano', 'Grande']

let ok = 0, errores = 0

for (const [archivo, nombreBase] of MAPA) {
  const ruta = resolve(BASE, archivo)
  const storageKey = `${slug(nombreBase)}.jpg`

  // 1. Leer imagen local
  let buffer
  try {
    buffer = readFileSync(ruta)
  } catch {
    console.error(`✗  No encontrado: ${archivo}`)
    errores++
    continue
  }

  // 2. Subir a Supabase Storage
  const { error: upErr } = await sb.storage
    .from('productos')
    .upload(storageKey, buffer, { upsert: true, contentType: 'image/jpeg' })

  if (upErr) {
    console.error(`✗  Storage error (${nombreBase}): ${upErr.message}`)
    errores++
    continue
  }

  // 3. Obtener URL pública
  const { data: pub } = sb.storage.from('productos').getPublicUrl(storageKey)
  const url = pub.publicUrl

  // 4. Actualizar todos los tamaños del producto en BD
  //    Coincide con: "Latte", "Latte Chico", "Latte Mediano", "Latte Grande"
  const nombresObjetivo = [nombreBase, ...TAMANIOS.map(t => `${nombreBase} ${t}`)]
  const ids = productos
    .filter(p => nombresObjetivo.includes(p.nombre))
    .map(p => p.id)

  if (ids.length === 0) {
    console.warn(`⚠  Sin productos en BD para: "${nombreBase}"`)
    errores++
    continue
  }

  const { error: updErr } = await sb
    .from('productos')
    .update({ imagen_url: url })
    .in('id', ids)

  if (updErr) {
    console.error(`✗  Update error (${nombreBase}): ${updErr.message}`)
    errores++
  } else {
    console.log(`✓  ${nombreBase.padEnd(28)} → ${ids.length} producto(s)`)
    ok++
  }
}

console.log(`\n✅ Listo: ${ok} imágenes subidas, ${errores} errores.`)
