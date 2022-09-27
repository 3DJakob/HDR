export const ConvertRawToRGB = (raw: Uint8Array, width: number, height: number): {r: Uint8Array, g: Uint8Array, b: Uint8Array} => {
  const r = new Uint8Array(width * height)
  const g = new Uint8Array(width * height)
  const b = new Uint8Array(width * height)

  let rawIndex = 0
  for (let i = 0; i < raw.length; i += 2) {
    // This is the already applied whitebalande which can be removed using this formula
    // const whitebalance = {
    //   r: 0.5423581733,
    //   g: 1,
    //   b: 0.7231703789
    // }
    const whitebalance = {
      r: 1,
      g: 1,
      b: 1
    }

    const isEvenRow = (i / width) % 2 === 0
    // isEvenRow = !isEvenRow
    r[rawIndex] = (isEvenRow ? raw[i + 1] : raw[i + 1 + width]) * whitebalance.r
    b[rawIndex] = (isEvenRow ? raw[i + width] : raw[i]) * whitebalance.b
    g[rawIndex] = (isEvenRow ? raw[i] : raw[i + 1]) * whitebalance.g

    rawIndex++

    r[rawIndex] = (isEvenRow ? raw[i + 1] : raw[i + 1 + width]) * whitebalance.r
    b[rawIndex] = (isEvenRow ? raw[i + width + 2] : raw[i + 2]) * whitebalance.b
    g[rawIndex] = (isEvenRow ? raw[i + 2] : raw[i + 1]) * whitebalance.g

    rawIndex++
  }

  return { r, g, b }
}

export const RGBToHSL = (rgb: {r: number, g: number, b: number}): {h: number, l: number, s: number} => {
  rgb.r /= 255
  rgb.g /= 255
  rgb.b /= 255
  const l = Math.max(rgb.r, rgb.g, rgb.b)
  const s = l - Math.min(rgb.r, rgb.g, rgb.b)
  const h = s
    ? l === rgb.r
      ? (rgb.g - rgb.b) / s
      : l === rgb.g
        ? 2 + (rgb.b - rgb.r) / s
        : 4 + (rgb.r - rgb.g) / s
    : 0
  return {
    h: 60 * h < 0 ? 60 * h + 360 : 60 * h,
    l: 100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
    s: (100 * (2 * l - s)) / 2
  }
}

export const HSLtoRGB = (hsl: {h: number, l: number, s: number}): {r: number, g: number, b: number} => {
  let r: number
  let g: number
  let b: number

  if (hsl.s === 0) {
    r = g = b = hsl.l // achromatic
  } else {
    const hue2rgb = function hue2rgb (p: number, q: number, t: number) {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = hsl.l < 0.5 ? hsl.l * (1 + hsl.s) : hsl.l + hsl.s - hsl.l * hsl.s
    const p = 2 * hsl.l - q
    r = hue2rgb(p, q, hsl.h + 1 / 3)
    g = hue2rgb(p, q, hsl.h)
    b = hue2rgb(p, q, hsl.h - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}
