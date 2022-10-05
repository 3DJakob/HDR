import React, { useEffect } from 'react'
import { extractSampleValuesFromImages, getActualRadiance, gsolveImage, Image, sampleChannels } from './lib/HDR'
import { GlobalStyle } from './styles/GlobalStyle'
import CanvasImage from './components/CanvasImage'
import Matrix from 'ml-matrix'
import { ArrayToMatrix } from './lib/ArrayToMatrix'
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

      const bMatrix = ArrayToMatrix(data[0].b, data[0].width, data[0].height)
      const gMatrix = ArrayToMatrix(data[1].g, data[1].width, data[1].height)
      const rMatrix = ArrayToMatrix(data[2].r, data[2].width, data[2].height)
      const matrixImages: [Matrix, Matrix, Matrix] = [bMatrix, gMatrix, rMatrix]

      const radianceMaps: [Matrix, Matrix, Matrix] = [
        new Matrix([g.gRed]),
        new Matrix([g.gGreen]),
        new Matrix([g.gBlue])
      ]

      // console.log(radianceMaps[0].get(0, 10))

      const foo = getActualRadiance(data[0].width, data[0].height, 3, data.length, matrixImages, radianceMaps, shutterSpeeds)
      console.log(foo)
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
