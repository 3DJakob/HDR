import React from 'react'
import { AxisOptions, Chart, Series } from 'react-charts'

export interface GSolverHistogramProps {
  responseFunctions: [number[], number[], number[]]
}

const GSolverHistogram: React.FC<GSolverHistogramProps> = ({ responseFunctions }) => {
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
      data: responseFunctions[0].map((value, i) => {
        return {
          date: i,
          value
        }
      })
    },
    {
      label: 'Green',
      data: responseFunctions[1].map((value, i) => {
        return {
          date: i,
          value
        }
      })
    },
    {
      label: 'Blue',
      data: responseFunctions[2].map((value, i) => {
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

  return (
    <div style={{ height: 200, width: '100%', display: 'flex', flexDirection: 'row' }}>
      <div style={{ height: 200, width: '100%' }}>
        <Chart
          options={{
            data: [data[0]],
            primaryAxis,
            secondaryAxes,
            getSeriesStyle
          }}
        />
      </div>
      <div style={{ height: 200, width: '100%' }}>
        <Chart
          options={{
            data: [data[1]],
            primaryAxis,
            secondaryAxes,
            getSeriesStyle
          }}
        />
      </div>
      <div style={{ height: 200, width: '100%' }}>
        <Chart
          options={{
            data: [data[2]],
            primaryAxis,
            secondaryAxes,
            getSeriesStyle
          }}
        />
      </div>
    </div>
  )
}

export default GSolverHistogram
