import convert from 'color-convert'

export const setSaturation = (rgb: {r: number, g: number, b: number}, saturation: number): {r: number, g: number, b: number} => {
  const hsl = convert.rgb.hsl(rgb.r, rgb.g, rgb.b)
  hsl[1] = saturation * hsl[1]
  const rgbout = convert.hsl.rgb(hsl)
  return { r: rgbout[0], g: rgbout[1], b: rgbout[2] }
}
