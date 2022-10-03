import Matrix from 'ml-matrix'
import React, { useEffect } from 'react'
import { convertRawToRGB } from './lib/BayerFilter'
import { gsolveImage, gSolveOneChannel, sampleChannels, weight } from './lib/HDR'
import { setSaturation } from './lib/Saturation'
import { GlobalStyle } from './styles/GlobalStyle'
import { AxisOptions, Chart } from 'react-charts'

let appInitialized = false

export const App: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = React.useState('Initiated')

  const [g, setG] = React.useState([0, 100, 150])

  const data = [
    {
      label: 'Series 1',
      data: g.map((value, i) => {
        return {
          date: i,
          value
        }
      })
    }
  ]

  const primaryAxis = React.useMemo<
  AxisOptions<typeof data[number]['data'][number]>
  >(
    () => ({
      getValue: (datum) => datum.value
    }),
    []
  )

  const secondaryAxes = React.useMemo<
  Array<AxisOptions<typeof data[number]['data'][number]>>
  >(
    () => [
      {
        getValue: (datum) => datum.date,
        stacked: true
      }
    ],
    []
  )

  useEffect(() => {
    if (appInitialized) return
    // listen for ipc messages
    // ipcRenderer.on('message', (event, message) => {
    //   console.log(message)
    // })

    window.Main.on('message', (message: Uint8Array[]) => {
      setStatus('Image data loaded')
      // data is an array of 3 arrays with the RAW values
      const data = message

      // const width = 2848
      // const height = 4256

      const width = 2848
      const height = 4288

      if (canvasRef.current != null) {
        console.log(data.length)
        setStatus('Images loaded: ' + String(data.length))

        const rgbs = data.map(d => convertRawToRGB(d, width, height))
        console.log('rgbs constructed')
        console.log('size', rgbs[0].r.length)
        const rMatrix = Matrix.zeros(rgbs[0].r.length, data.length)
        // const gMatrix = Matrix.zeros(rgbs[0].r.length, data.length)
        // const bMatrix = Matrix.zeros(rgbs[0].r.length, data.length)
        console.log('matrixes constructed')
        for (let i = 0; i < data.length; i++) {
          console.log('inside loop', i)
          console.log('rgb')
          rMatrix.setColumn(i, rgbs[i].r)
          // gMatrix.setColumn(i, rgbs[i].g)
          // bMatrix.setColumn(i, rgbs[i].b)
        }

        // console.log('rMatrix', rMatrix)

        const shutterSpeeds = [Math.log(1 / 400), Math.log(1 / 125), Math.log(1 / 20)]
        const samples = 150
        const smothness = 100
        const resRed = gSolveOneChannel(rMatrix, shutterSpeeds, smothness, samples, 3)
        console.log(resRed)
        setG(resRed.g)
        // const res = gsolveImage([rMatrix, gMatrix, bMatrix], shutterSpeeds, 1.0, samples, 3)
        // console.log(res)

        // display image data

        // const canvas = canvasRef.current
        // canvas.width = width
        // canvas.height = height
        // const ctx = canvas.getContext('2d')
        // if (ctx != null) {
        //   const imageData = ctx.createImageData(width, height)
        //   // const data32 = new Uint8Array(imageData.data.buffer)
        //   // data32 är 4x sizen av data
        //   let k = 0
        //   const rgb = convertRawToRGB(data, width, height)

        //   // for (let i = 0; i < data.length; i += 1) {
        //   for (let i = 0; i < imageData.data.length; i += 4) {
        //     // Demosaic
        //     // Camera multipliers: 2912.000000 1024.000000 1416.000000 1024.000000
        //     // Daylight multipliers: 2.596776 0.938604 1.339606

        //     if (rgb.r[i] != null) {
        //       const rgbSat = setSaturation({ r: rgb.r[i], g: rgb.g[i], b: rgb.b[i] }, 2.5)
        //       imageData.data[i] = rgbSat.r
        //       imageData.data[i + 1] = rgbSat.g
        //       imageData.data[i + 2] = rgbSat.b
        //       imageData.data[i + 3] = 255
        //       k = k + 4
        //     }
        //   }
        //   ctx.putImageData(imageData, 0, 0)
        // }
      }
    })

    appInitialized = true
  }, [])

  const loadImages = (): void => {
    window.Main.sendMessage('generateHDR')
    setStatus('Loading images')
  }

  const testGSolve = (): void => {
    const res = gsolveImage(sampleChannels, [Math.log(32), Math.log(4), Math.log(1 / 4), Math.log(1 / 64)], 200, 10, 3)
    setG(res.gRed)
  }

  return (
    <>
      <GlobalStyle />
      <canvas ref={canvasRef} />
      <h2 style={{ color: '#fff' }}>{status}</h2>
      <button onClick={loadImages}>Generate HDR</button>
      <button onClick={() => window.Main.sendMessage('saveImage')}>Save image png</button>
      <button onClick={testGSolve}>Gsolve</button>

      <div style={{ height: 200 }}>
        <Chart
          options={{
            data,
            primaryAxis,
            secondaryAxes
          }}
        />
      </div>

      {/* <button onClick={() => weight(100)}>weight</button> */}
    </>
  )
}
