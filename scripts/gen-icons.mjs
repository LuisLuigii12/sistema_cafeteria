import sharp from 'sharp'

async function makeIcon(size) {
  const half = size / 2
  const circle = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${half}" cy="${half}" r="${half}" fill="#1C0A00"/></svg>`
  )

  const logoSize = Math.round(size * 0.85)
  const offset = Math.round((size - logoSize) / 2)

  const logo = await sharp('public/logo.png')
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer()

  await sharp(circle)
    .composite([{ input: logo, top: offset, left: offset }])
    .png()
    .toFile(`public/icon-${size}.png`)

  console.log(`icon-${size}.png ok`)
}

await Promise.all([makeIcon(192), makeIcon(512)])
