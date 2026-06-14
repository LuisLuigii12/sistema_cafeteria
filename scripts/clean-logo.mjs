import sharp from 'sharp'

const src = 'public/Gemini_Generated_Image_eu3ltpeu3ltpeu3l.png'
const { width: w, height: h } = await sharp(src).metadata()

const buf = await sharp(src).raw().toBuffer()

for (let i = 0; i < buf.length; i += 4) {
  const r = buf[i], g = buf[i + 1], b = buf[i + 2]
  // Solo conservar pixeles dorados (R claramente mayor que B)
  // El watermark es gris neutro (R≈G≈B) → R-B≈0 → se elimina automaticamente
  const isGold = (r - b) > 40 && r > 90
  if (!isGold) buf[i + 3] = 0
}

await sharp(buf, { raw: { width: w, height: h, channels: 4 } })
  .png()
  .toFile('public/logo.png')

console.log('listo')
