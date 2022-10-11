import React, { useEffect } from 'react'
import { extractSampleValuesFromImages, getActualRadiance, gsolveImage, Image, sampleChannels } from './lib/HDR'
import { GlobalStyle } from './styles/GlobalStyle'
import CanvasImage from './components/CanvasImage'
import Matrix from 'ml-matrix'
import { ArrayToMatrix } from './lib/ArrayToMatrix'
import { saveImage } from '../electron/jimp'
let appInitialized = false

export const App: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = React.useState('Initiated')
  // const [rawImagesData, setRawImagesData] = React.useState<[Uint8Array, Uint8Array, Uint8Array]>()
  const [RGBImagesData, setRGBImagesData] = React.useState<[Image, Image, Image]>()

  // const [g, setG] = React.useState<[number[], number[], number[]]>([[0, 100, 150], [0, 100, 150], [0, 100, 150]])

  useEffect(() => {
    if (appInitialized) return

    window.Main.on('message', (message: [Image, Image, Image]) => {
      setStatus('Image data loaded')
      console.log('Received images from main process')
      const data = message

      const samples = extractSampleValuesFromImages(data)
      const shutterSpeeds = [Math.log(1 / 400), Math.log(1 / 125), Math.log(1 / 20)]
      const g = gsolveImage(samples, shutterSpeeds, 100, 10, samples.length)
      console.log(g, 'g')

      const r1Matrix = ArrayToMatrix(data[0].r, data[0].width, data[0].height)
      const r2Matrix = ArrayToMatrix(data[1].r, data[1].width, data[1].height)
      const r3Matrix = ArrayToMatrix(data[2].r, data[2].width, data[2].height)

      const b1Matrix = ArrayToMatrix(data[0].b, data[0].width, data[0].height)
      const b2Matrix = ArrayToMatrix(data[1].b, data[1].width, data[1].height)
      const b3Matrix = ArrayToMatrix(data[2].b, data[2].width, data[2].height)

      const g1Matrix = ArrayToMatrix(data[0].g, data[0].width, data[0].height)
      const g2Matrix = ArrayToMatrix(data[1].g, data[1].width, data[1].height)
      const g3Matrix = ArrayToMatrix(data[2].g, data[2].width, data[2].height)

      const radianceMaps: [Matrix, Matrix, Matrix] = [
        new Matrix([g.gRed]),
        new Matrix([g.gGreen]),
        new Matrix([g.gBlue])
      ]

      // console.log(radianceMaps[0].get(0, 10))

      const red = getActualRadiance([r1Matrix, r2Matrix, r3Matrix], radianceMaps, shutterSpeeds)
      const blue = getActualRadiance([b1Matrix, b2Matrix, b3Matrix], radianceMaps, shutterSpeeds)
      const green = getActualRadiance([g1Matrix, g2Matrix, g3Matrix], radianceMaps, shutterSpeeds)

      const image: Image = {
        r: new Uint8Array(red.to1DArray()),
        g: new Uint8Array(green.to1DArray()),
        b: new Uint8Array(blue.to1DArray()),
        width: data[0].width,
        height: data[0].height
      }

      // Send image to server
      window.Main.sendImage(JSON.stringify(image))
      // saveImage(image, image.width, image.height, 'test.jpg')

      // console.log(foo, 'THE ACTUAL RADIANCE')
      // setRGBImagesData(data)
    })

    appInitialized = true
  }, [])

  const loadImages = (): void => {
    window.Main.sendMessage('loadPNGImages')
    setStatus('Loading images')
  }

  const testGSolve = (): void => {
    const res = gsolveImage(sampleChannels, [Math.log(32), Math.log(4), Math.log(1 / 4), Math.log(1 / 64)], 200, 10, 3)
    console.log(res)
    // setG([res.gRed, res.gGreen, res.gBlue])
  }

  return (
    <>
      <GlobalStyle />
      {RGBImagesData != null && (
        <CanvasImage rgb={RGBImagesData[0]} />
      )}

      {/* {rawImagesData != null && ( */}
      {/* <GSolverHistogram raw={rawImagesData} /> */}
      {/* )} */}

      <canvas ref={canvasRef} />
      <h2 style={{ color: '#fff' }}>{status}</h2>
      <button onClick={loadImages}>Generate HDR</button>
      <button onClick={() => window.Main.sendMessage('saveImage')}>Save image png</button>
      <button onClick={testGSolve}>Gsolve</button>

      {/* <button onClick={() => weight(100)}>weight</button> */}
    </>
  )
}
