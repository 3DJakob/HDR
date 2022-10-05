import Matrix from 'ml-matrix'
import React, { useEffect } from 'react'
import { AxisOptions, Chart, Series } from 'react-charts'
import { convertRawToRGB } from '../lib/BayerFilter'
import { gSolveOneChannel } from '../lib/HDR'

export interface GSolverHistogramProps {
  raw?: [Uint8Array, Uint8Array, Uint8Array]
}

const GSolverHistogram: React.FC<GSolverHistogramProps> = ({ raw }) => {
  const [g, setG] = React.useState<[number[], number[], number[]]>([[0, 100, 150], [0, 100, 150], [0, 100, 150]])

  const getSeriesStyle = React.useCallback((series: Series<{ date: number, value: number }>) => {
    const colorPalette = {
      Red: 'red',
      Green: 'green',
      Blue: 'blue'
    }

    return {
      fill: colorPalette[series.label],
      stroke: colorPalette[series.label]
    }
  }, [])

  const data = [
    {
      label: 'Red',
      data: g[0].map((value, i) => {
        return {
          date: i,
          value
        }
      })
    },
    {
      label: 'Green',
      data: g[1].map((value, i) => {
        return {
          date: i,
          value
        }
      })
    },
    {
      label: 'Blue',
      data: g[2].map((value, i) => {
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
    if (raw == null) return

    console.warn('NEW DATA LOADED')

    const width = 2848
    const height = 4288

    const rgbs = raw.map(d => convertRawToRGB(d, width, height))
    console.log('rgbs constructed')
    console.log('size', rgbs[0].r.length)
    const rMatrix = Matrix.zeros(rgbs[0].r.length, raw.length)
    const gMatrix = Matrix.zeros(rgbs[0].r.length, raw.length)
    const bMatrix = Matrix.zeros(rgbs[0].r.length, raw.length)
    console.log('matrixes constructed')
    for (let i = 0; i < raw.length; i++) {
      console.log('inside loop', i)
      console.log('rgb')
      rMatrix.setColumn(i, rgbs[i].r)
      gMatrix.setColumn(i, rgbs[i].g)
      bMatrix.setColumn(i, rgbs[i].b)
    }

    const shutterSpeeds = [Math.log(1 / 400), Math.log(1 / 125), Math.log(1 / 20)]
    const samples = 150
    const smothness = 100
    const resRed = gSolveOneChannel(rMatrix, shutterSpeeds, smothness, samples, 3)
    const resGreen = gSolveOneChannel(gMatrix, shutterSpeeds, smothness, samples, 3)
    const resBlue = gSolveOneChannel(bMatrix, shutterSpeeds, smothness, samples, 3)
    // setG([resRed.g, resGreen.g, resBlue.g])

    console.log('res', resRed.g)
  }, [raw])

  return (
    <div style={{ height: 200 }}>
      <Chart
        options={{
          data,
          primaryAxis,
          secondaryAxes,
          getSeriesStyle
        }}
      />
    </div>
  )
}

export default GSolverHistogram
