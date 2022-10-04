import convert from 'color-convert'
import { Image } from './HDR'

export const setSaturationPixel = (rgb: {r: number, g: number, b: number}, saturation: number): {r: number, g: number, b: number} => {
  const hsl = convert.rgb.hsl(rgb.r, rgb.g, rgb.b)
  hsl[1] = saturation * hsl[1]
  const rgbout = convert.hsl.rgb(hsl)
  return { r: rgbout[0], g: rgbout[1], b: rgbout[2] }
}

export const setSaturationImage = (rgb: Image): Image => {
  for (let i = 0; i < rgb.r.length; i++) {
    const rgbSat = setSaturationPixel({ r: rgb.r[i], g: rgb.g[i], b: rgb.b[i] }, 2.5)
    rgb.r[i] = rgbSat.r > 255 ? 255 : rgbSat.r
    rgb.g[i] = rgbSat.g > 255 ? 255 : rgbSat.g
    rgb.b[i] = rgbSat.b > 255 ? 255 : rgbSat.b
  }
  return rgb
}
