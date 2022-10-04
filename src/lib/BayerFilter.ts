import { Image } from './HDR'

export const convertRawToRGB = (raw: Uint8Array, width: number, height: number): Image => {
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
