import { createClient } from '@supabase/supabase-js'
import https from 'https'
import http from 'http'

const sb = createClient(
  'https://rcbcevvfujsmjjibrecw.supabase.co',
  'sb_publishable_IcQHXBB6r9KQhDiZxCs17w__HzTvfU7'
)

// Pexels photo IDs — confiables y sin autenticación en CDN directo
const BASE = 'https://images.pexels.com/photos'
const px = (id) => `${BASE}/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop`

const IMAGENES = {
  // ── Cafetería / Bebidas ─────────────────────────────────────
  'Agua Natural':        px(1000084),
  'Café Americano':      px(302899),
  'Cappuccino':          px(312418),
  'Latte':               px(1193335),
  'Té Verde':            px(1417945),
  'Jugo de Naranja':     px(96974),
  'Refresco':            px(3851024),

  // ── Cafetería / Postres ─────────────────────────────────────
  'Cheesecake':          px(1126359),
  'Pastel de Chocolate': px(291528),
  'Flan':                px(2373520),

  // ── Cafetería / Snacks ──────────────────────────────────────
  'Galletas':            px(890577),
  'Tostadas':            px(5836406),

  // ── Cocina / Desayunos ──────────────────────────────────────
  'Hotcakes':            px(1343504),
  'Huevos Revueltos':    px(704569),
  'Chilaquiles':         px(5737581),
  'Enfrijoladas':        px(5737595),
  'Omelette':            px(824635),

  // ── Cocina / Comidas ────────────────────────────────────────
  'Ensalada César':      px(1211887),
  'Pasta Primavera':     px(1279330),
  'Pollo a la Plancha':  px(2338407),
  'Sandwich Club':       px(1647163),
  'Sopa del Día':        px(299347),
}

function download(url, redirects = 5) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http
    const opts = new URL(url)
    lib.get({ hostname: opts.hostname, path: opts.pathname + opts.search, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects > 0) {
        const next = res.headers.location.startsWith('http') ? res.headers.location : `${opts.protocol}//${opts.hostname}${res.headers.location}`
        return download(next, redirects - 1).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`))
      const ct = res.headers['content-type'] || ''
      if (!ct.startsWith('image/')) return reject(new Error(`Content-Type: ${ct}`))
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => resolve({ buffer: Buffer.concat(chunks), type: ct }))
      res.on('error', reject)
    }).on('error', reject)
  })
}

const { data: productos } = await sb.from('productos').select('id, nombre')

let ok = 0, err = 0
for (const p of productos) {
  const url = IMAGENES[p.nombre]
  if (!url) { console.log(`⚠  Sin imagen: ${p.nombre}`); continue }

  try {
    const { buffer, type } = await download(url)
    const { error: upErr } = await sb.storage.from('productos').upload(`${p.id}.jpg`, buffer, { upsert: true, contentType: type })
    if (upErr) throw upErr
    const { data: pub } = sb.storage.from('productos').getPublicUrl(`${p.id}.jpg`)
    await sb.from('productos').update({ imagen_url: pub.publicUrl }).eq('id', p.id)
    console.log(`✓  ${p.nombre}`)
    ok++
  } catch (e) {
    console.error(`✗  ${p.nombre}: ${e.message}`)
    err++
  }
}

console.log(`\nListo: ${ok} ok, ${err} errores`)
