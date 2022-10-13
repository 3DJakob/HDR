import ImageData from '@canvas/image-data'
import lodepng from '@cwasm/lodepng'
import Jimp from 'jimp'

import { Image } from '../src/lib/HDR'

export const sampleImageData = [
  [0xFF0000FF, 0xFF0000FF, 0xFF0000FF],
  [0xFF0000FF, 0x00FF00FF, 0xFF0000FF],
  [0xFF0000FF, 0xFF0000FF, 0x0000FFFF]
]

export function rgbToHex (r: number[], g: number[], b: number[]): number[] {
  // return (r << 16) + (g << 8) + b
  const out = []
  for (let i = 0; i < r.length; i++) {
    out.push((r[i] << 16) + (g[i] << 8) + b[i])
  }
  // add alpha channel
  return out.map((v) => v + 0xFF000000)
}

export function reshapeArrayToImage (array: number[], width: number, height: number): number[][] {
  const out = []
  for (let i = 0; i < array.length; i += width) {
    out.push(array.slice(i, i + width))
  }
  return out
}

export async function encodeImageToPNG (imageData: Image): Promise<Buffer> {
  const { width, height } = imageData
  const result = new ImageData(width, height)

  console.time('b')
  let dst = 0
  for (let src = 0; src < width * height; src++) {
    result.data[dst++] = imageData.r[src]
    result.data[dst++] = imageData.g[src]
    result.data[dst++] = imageData.b[src++]
    result.data[dst++] = 255
  }
  console.timeEnd('b')

  console.time('a')
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      result.data[y * width * 4 + x * 4 + 0] = imageData.r[y * width + x]
      result.data[y * width * 4 + x * 4 + 1] = imageData.g[y * width + x]
      result.data[y * width * 4 + x * 4 + 2] = imageData.b[y * width + x]
      result.data[y * width * 4 + x * 4 + 3] = 255
    }
  }
  console.timeEnd('a')

  return lodepng.encode(result)
}

export function saveImage (imageData: Image, width: number, height: number, filename: string): void {
  const image = new Jimp(width, height, function (err, image) {
    if (err != null) throw err

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = Jimp.rgbaToInt(imageData.r[y * width + x], imageData.g[y * width + x], imageData.b[y * width + x], 255)
        image.setPixelColor(color, x, y)
      }
    }

    image.write(filename, (err) => {
      if (err != null) throw err
    })
  })
  console.log('Saved image ' + filename)
}
