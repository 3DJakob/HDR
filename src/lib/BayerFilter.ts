export const ConvertRawToRGB = (raw: Uint8Array, width: number, height: number): {r: Uint8Array, g: Uint8Array, b: Uint8Array} => {
  const r = new Uint8Array(width * height)
  const g = new Uint8Array(width * height)
  const b = new Uint8Array(width * height)

  let rawIndex = 0
  for (let i = 0; i < raw.length; i += 2) {
    const isEvenRow = (i / width) % 2 === 0
    r[rawIndex] = isEvenRow ? raw[i + 1] : raw[i + 1 + width]

    rawIndex++
  }
  rawIndex = 0
  for (let i = 0; i < raw.length; i += 2) {
    const isEvenRow = (i / width) % 2 === 0
    b[rawIndex] = isEvenRow ? raw[i + width] : raw[i]

    rawIndex++
  }
  rawIndex = 0
  for (let i = 0; i < raw.length; i += 2) {
    const isEvenRow = (i / width) % 2 === 0
    g[rawIndex] = isEvenRow ? raw[i] : raw[i + 1]

    rawIndex++
  }

  return { r, g, b }
}
