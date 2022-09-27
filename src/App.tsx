import { Greetings } from './components/Greetings'
import React, { useEffect } from 'react'
import { ConvertRawToRGB, HSLtoRGB, RGBToHSL } from './lib/BayerFilter'
import { convertRGBToXYZ, convertXYZToRGB } from './lib/XYZ'
import { setSaturation } from './lib/Saturation'

export const App: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // listen for ipc messages
    // ipcRenderer.on('message', (event, message) => {
    //   console.log(message)
    // })

    window.Main.on('message', (message: Uint8Array) => {
      console.log(message)

      if (canvasRef.current != null) {
        const data = message
        console.log(data.length)
        // display image data
        // const width = 2848
        // const height = 4256

        const width = 2848
        const height = 4288

        const canvas = canvasRef.current
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx != null) {
          const imageData = ctx.createImageData(width, height)
          // const data32 = new Uint8Array(imageData.data.buffer)
          // data32 är 4x sizen av data
          let k = 0
          console.log(data[214], 'data 0')

          const rgb = ConvertRawToRGB(data, width, height)

          // const xyz = convertRGBToXYZ(rgb, width, height)
          // rgb = convertXYZToRGB(xyz, width, height)

          // rgb.r.map((r, i) => {
          //   const hsl = RGBToHSL({r, g: rgb.g[i], b: rgb.b[i]})
          //   rgb.g[i] = hsl.s
          //   rgb.b[i] = hsl.l
          //   return hsl.h
          // })

          // rgb.r.map((r, i) => {
          //   const rgbVal = HSLtoRGB({h: r, l: rgb.g[i], s: rgb.b[i]})
          //   rgb.g[i] = rgbVal.g
          //   rgb.b[i] = rgbVal.b
          //   return rgbVal.r
          // })

          // for (let i = 0; i < data.length; i += 1) {
          for (let i = 0; i < imageData.data.length; i += 4) {
            // Demosaic
            // Camera multipliers: 2912.000000 1024.000000 1416.000000 1024.000000
            // Daylight multipliers: 2.596776 0.938604 1.339606

            if (rgb.r[i] != null) {
              const rgbSat = setSaturation({ r: rgb.r[i], g: rgb.g[i], b: rgb.b[i] }, 2.5)
              // console.log(setSaturation)
              imageData.data[i] = rgbSat.r
              imageData.data[i + 1] = rgbSat.g
              imageData.data[i + 2] = rgbSat.b
              imageData.data[i + 3] = 255
              k = k + 4
            }
          }
          ctx.putImageData(imageData, 0, 0)
        }
      }
    })
  }, [])

  return (
    <>
      {/* <GlobalStyle /> */}
      <canvas ref={canvasRef} />
      <Greetings />
    </>
  )
}
