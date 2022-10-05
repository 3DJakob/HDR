import React, { useEffect } from 'react'
import { Image } from '../../src/lib/HDR'
import { convertRawToRGB } from '../lib/BayerFilter'
import { setSaturationPixel } from '../lib/Saturation'

export interface CanvasImageProps {
  raw?: Uint8Array
  rgb?: Image
}

const CanvasImage: React.FC<CanvasImageProps> = ({ raw, rgb }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // setStatus('Image data loaded')
    // data is an array of 3 arrays with the RAW values
    // const data = image

    // const width = 2848
    // const height = 4256

    let width = 2848
    let height = 4288

    if (canvasRef.current != null) {
      let image: Image

      if (rgb != null) {
        image = rgb
        width = rgb.width
        height = rgb.height
      } else if (raw != null) {
        image = convertRawToRGB(raw, width, height)
      } else {
        return
      }

      console.log('rgbs constructed with size', image.r.length, image.g.length, image.b.length)

      // display image data

      const canvas = canvasRef.current
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (ctx != null) {
        const imageData = ctx.createImageData(width, height)
        // const data32 = new Uint8Array(imageData.data.buffer)
        // data32 är 4x sizen av data
        let k = 0
        const rgb = image
        console.log(image)
        // for (let i = 0; i < data.length; i += 1) {
        for (let i = 0; i < image.r.length; i += 4) {
        // Demosaic
        // Camera multipliers: 2912.000000 1024.000000 1416.000000 1024.000000
        // Daylight multipliers: 2.596776 0.938604 1.339606

          if (rgb.r[i] != null) {
            imageData.data[i] = rgb.r[i]
            imageData.data[i + 1] = rgb.g[i]
            imageData.data[i + 2] = rgb.b[i]
            imageData.data[i + 3] = 255
            k = k + 4
          }
        }

        ctx.putImageData(imageData, 0, 0)
      }
    }
  }, [raw, rgb])

  return (
    <div>
      <canvas ref={canvasRef} />
    </div>
  )
}

export default CanvasImage
