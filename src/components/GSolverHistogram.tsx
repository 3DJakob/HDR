import React from 'react'
import { AxisOptions, Chart, Series } from 'react-charts'
import styled from 'styled-components'

export interface GSolverHistogramProps {
  responseFunctions: [number[], number[], number[]]
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  width: 100%;
`

const GraphContainer = styled.div`
  flex: 1;
  height: 200px;
  margin: 20px;
  box-sizing: 'border-box';
`

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
    <Container>
      <GraphContainer>
        <Chart
          options={{
            data: [data[0]],
            primaryAxis,
            secondaryAxes,
            getSeriesStyle
          }}
        />
      </GraphContainer>
      <GraphContainer>
        <Chart
          options={{
            data: [data[1]],
            primaryAxis,
            secondaryAxes,
            getSeriesStyle
          }}
        />
      </GraphContainer>
      <GraphContainer>
        <Chart
          options={{
            data: [data[2]],
            primaryAxis,
            secondaryAxes,
            getSeriesStyle
          }}
        />
      </GraphContainer>
    </Container>
  )
}

export default GSolverHistogram
