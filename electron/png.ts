import getPixels from 'get-pixels'
import { Image } from '../src/lib/HDR'

export const loadPNG = async (path: string): Promise<Image> => {
  const imageOut: Image = {
    r: new Uint8Array(),
    g: new Uint8Array(),
    b: new Uint8Array(),
    width: 0,
    height: 0
  }
  console.log('Loading image')

  const pixels = await new Promise((resolve, reject) => {
    getPixels(path, (err, pixels) => {
      if (err != null) {
        reject(err)
      } else {
        resolve(pixels)
      }
    })
  })

  const imageWidth = pixels.shape[0]
  const imageHeight = pixels.shape[1]

  console.log(imageWidth, 'x', imageHeight, '=', imageWidth * imageHeight)
  imageOut.height = imageHeight
  imageOut.width = imageWidth

  for (let i = 0; i < 3; i++) {
    const currentImage = new Uint8Array(imageWidth * imageHeight)
    for (let y = 0; y < imageHeight; y++) {
      for (let x = 0; x < imageWidth; x++) {
        currentImage[y * imageWidth + x] = pixels.get(x, y, i)
      }
    }
    const channel = i === 0 ? 'r' : i === 1 ? 'g' : 'b'
    imageOut[channel] = currentImage
  }

  return imageOut
}
