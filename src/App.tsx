import { GlobalStyle } from './styles/GlobalStyle'

import { Greetings } from './components/Greetings'
import React, { useEffect } from 'react'
import { ipcRenderer } from 'electron'

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
        const width = 2848
        const height = 4256

        const canvas = canvasRef.current
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx != null) {
          const imageData = ctx.createImageData(width, height)
          const data32 = new Uint32Array(imageData.data.buffer)
          for (let i = 0; i < data.length; i += 3) {
            data32[i] = 0xff000000 | data[i] + (data[i + 1] << 8) + (data[i + 2] << 16)
          }
          ctx.putImageData(imageData, 0, 0)
          // document.body.appendChild(canvas)
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
