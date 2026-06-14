import sharp from 'sharp'

const src = 'public/Gemini_Generated_Image_eu3ltpeu3ltpeu3l.png'
const { width: w, height: h } = await sharp(src).metadata()

const buf = await sharp(src).raw().toBuffer()

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4
    const r = buf[i], g = buf[i + 1], b = buf[i + 2]

    // Watermark region → siempre transparente
    if (x > 850 && y > 700) { buf[i + 3] = 0; continue }

    // Conservar solo píxeles dorados: R >> B, color cálido brillante
    const isGold = (r - b) > 40 && r > 90

    buf[i + 3] = isGold ? buf[i + 3] : 0
  }
}

await sharp(buf, { raw: { width: w, height: h, channels: 4 } })
  .png()
  .toFile('public/logo.png')

console.log('listo')
