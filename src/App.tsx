import { Greetings } from './components/Greetings'
import React, { useEffect } from 'react'
import { ConvertRawToRGB } from './lib/BayerFilter'

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
          const data32 = new Uint8Array(imageData.data.buffer)
          // data32 är 4x sizen av data
          let k = 0
          console.log(data[214], 'data 0')

          const rgb = ConvertRawToRGB(data, width, height)

          for (let i = 0; i < data.length; i += 1) {
            // Demosaic
            // Camera multipliers: 2912.000000 1024.000000 1416.000000 1024.000000
            // Daylight multipliers: 2.596776 0.938604 1.339606

            data32[k] = 0xff000000 | rgb.r[i]
            data32[k + 1] = 0xff000000 | rgb.g[i]
            data32[k + 2] = 0xff000000 | rgb.b[i]
            data32[k + 3] = 0xff000000 | 255
            k = k + 4
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
