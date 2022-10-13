import ImageData from '@canvas/image-data'

export interface Image {
  r: Uint8Array
  g: Uint8Array
  b: Uint8Array
  width: number
  height: number
}

export function imageToImageData (image: Image): ImageData {
  const { width, height } = image
  const result = new ImageData(width, height)

  let dst = 0
  for (let src = 0; src < width * height; src++) {
    result.data[dst++] = image.r[src]
    result.data[dst++] = image.g[src]
    result.data[dst++] = image.b[src]
    result.data[dst++] = 255
  }

  return result
}
