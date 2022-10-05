import dcraw from 'dcraw'
import fs from 'fs'
import { RawInfo } from './dcraw-types'

export const readImage = (filename: string): any => {
  // const buf = fs.readFileSync('./sample.CR3')
  // const info = dcraw(buf, { verbose: true, identify: true })
  // console.log(info)

  // // dcraw(buf, { verbose: true, deadpixels: true, identify: true, output: 'ppm' });

  // const dataDead = dcraw(buf, { verbose: true, deadpixels: false })
  // const data = dcraw(buf, { verbose: true, deadpixels: true })

  // console.log(data.map((x, i) => {
  //   return x - dataDead[i]
  // }))

  // load raw image data
  const buf = fs.readFileSync('./' + filename)
  // const data: Uint8Array = dcraw(buf, { verbose: true, deadpixels: true })
  // 12121105
  // 2832 * 4240 = 12007680

  // console.log(data.length, 'THE LENGTH')

  // get image dimensions
  const info: any = dcraw(buf, { verbose: true, identify: true })
  // interpolate RGB as four color -f
  // const data = dcraw(buf, { verbose: true, deadpixels: true, setFourColorMode: true })
  const data: Uint8Array = dcraw(buf, { verbose: true, deadpixels: true })

  const { width, height } = info
  // console.log(info, 'info')
  // console.log(data, 'data')
  console.log('Image read: ' + filename)

  return data
  // display image data
  // const width = width
  // const height = height
  // const canvas = document.createElement('canvas')
  // canvas.width = width
  // canvas.height = height
  // const ctx = canvas.getContext('2d')
  // const imageData = ctx.createImageData(width, height)
  // const data32 = new Uint32Array(imageData.data.buffer)
  // for (let i = 0; i < data.length; i++) {
  //   data32[i] = 0xff000000 | data[i]
  // }
  // ctx.putImageData(imageData, 0, 0)
  // document.body.appendChild(canvas)
}

export const convertRAWtoTIFF = (filename: string, outputFilename: string): any => {
  const buf = fs.readFileSync('./' + filename)
  console.log('image loaded...')
  // const tiffFile = dcraw(buf, { verbose: true, deadpixels: true, output: 'tiff' })
  const tiffFile = dcraw(buf, { exportAsTiff: true })
  console.log('Image converted to TIFF: ' + filename)
  fs.writeFileSync(outputFilename, tiffFile)
}

export const readImageAsRGB = (filename: string): any => {
  // setFourColorMode

  const buf = fs.readFileSync('./' + filename)
  // const data = dcraw(buf, { use16BitMode: true })
  const data = dcraw(buf, { })
  // 2848 × 4256 = 12121088
  // 72726547
  // 36363281

  // const data = dcraw(buf, { setColorSpace: 2 })
  // Uint8Array(12121105)
  // 24242195
  console.log(data)
}
