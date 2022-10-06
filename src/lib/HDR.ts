import { Matrix, solve } from 'ml-matrix'

// https://www.npmjs.com/package/ml-matrix

// const addition       = Matrix.add(A, B);
// const multiplication = A.mmul(B);

// const a = [
//   [22, 10, 2, 3, 7],
//   [14, 7, 10, 0, 8],
//   [-1, 13, -1, -11, 3],
//   [-3, -2, 13, -2, 4],
//   [9, 8, 1, -2, 4],
//   [9, 1, -7, 5, -1],
//   [2, -6, 6, 5, 1],
//   [4, 5, 0, -2, 2]
// ]

// const { u, v, q } = SVD(a)
// console.log(u)
// console.log(v)
// console.log(q)

export function weight (x: number): number {
  let out = 0
  if (x < (255 / 2)) {
    out = x
  } else {
    out = 255 - x
  }

  return out
}

const sampleChannel = [255, 255, 255, 255]

const sampleShutterSpeed = [
  1 / 8000,
  1 / 6400
]

export interface Image {
  r: Uint8Array
  g: Uint8Array
  b: Uint8Array
  width: number
  height: number
}

const sampleImages: Image[] = [
  {
    r: Uint8Array.from([200, 200, 200, 200]),
    g: Uint8Array.from([200, 200, 200, 200]),
    b: Uint8Array.from([200, 200, 200, 200]),
    width: 2,
    height: 2
  },
  {
    r: Uint8Array.from([100, 100, 100, 100]),
    g: Uint8Array.from([100, 100, 100, 100]),
    b: Uint8Array.from([100, 100, 100, 100]),
    width: 2,
    height: 2
  },
  {
    r: Uint8Array.from([50, 50, 50, 50]),
    g: Uint8Array.from([50, 50, 50, 50]),
    b: Uint8Array.from([50, 50, 50, 50]),
    width: 2,
    height: 2
  }
]

export function extractSampleValuesFromImages (images: Image[]): [Matrix, Matrix, Matrix] {
  const samples = 10
  const imageAmount = images.length
  const matrixR = Matrix.zeros(samples, imageAmount)
  const matrixG = Matrix.zeros(samples, imageAmount)
  const matrixB = Matrix.zeros(samples, imageAmount)

  for (let i = 0; i < samples; i++) {
    // pick random point
    const randomPixelIndex = Math.floor(Math.random() * images[0].r.length)

    const valuesInPixelRed = []
    const valuesInPixelBlue = []
    const valuesInPixelGreen = []

    for (let j = 0; j < imageAmount; j++) {
      valuesInPixelRed.push(images[j].r[randomPixelIndex])
      valuesInPixelBlue.push(images[j].b[randomPixelIndex])
      valuesInPixelGreen.push(images[j].g[randomPixelIndex])
    }

    matrixR.setRow(i, valuesInPixelRed)
    matrixG.setRow(i, valuesInPixelGreen)
    matrixB.setRow(i, valuesInPixelBlue)
  }

  return [matrixR, matrixG, matrixB]
}

export const sampleChannels = extractSampleValuesFromImages(sampleImages)

export function gSolveOneChannel (channel: Matrix, shutterSpeed: number[], smoothness: number, samples: number, imageAmount: number): {g: number[], LE: number[]} {
  const n = 255
  // console.log(samples * imageAmount + n + 1)
  const A = Matrix.zeros(samples * imageAmount + n + 1, n + samples)
  const b = Matrix.zeros(A.rows, 1)

  // Data fitting Equation
  let k = 0
  for (let i = 0; i < samples; i++) {
    for (let j = 0; j < imageAmount; j++) {
      // console.log('to weight', Number(channel.get(i, j)))
      const wij = weight(Number(channel.get(i, j)) + 1)
      A.set(k, channel.get(i, j), wij)
      A.set(k, n + i, -wij)
      // console.log('setting', wij * shutterSpeed[j])
      b.set(k, 0, wij * shutterSpeed[j])
      k = k + 1
    }
  }

  // Fix the curve by setting its middle value to 0
  A.set(k, 128, 1)
  k = k + 1

  // Smoothness equation
  // Include the smoothness equations
  for (let i = 0; i < n - 2; i++) {
    A.set(k, i, smoothness * weight(i + 1))
    A.set(k, i + 1, -2 * smoothness * weight(i + 1))
    A.set(k, (i + 2), (smoothness * weight(i + 1)))
    k = k + 1
  }

  // Solve the system using SVD
  // Rows 405, Columns 1
  const x = solve(A, b, true)

  // A * x = b

  const g = x.getColumn(0).slice(0, n)
  const LE = x.getColumn(0).slice(n, x.rows)

  return {
    g,
    LE
  }
}

export interface gSolveReturn {
  gRed: number[]
  gGreen: number[]
  gBlue: number[]
  LERed: number[]
  LEGreen: number[]
  LEBlue: number[]
}

export function gsolveImage (
  channel: [Matrix, Matrix, Matrix],
  shutterSpeed: number[],
  smoothness: number,
  samples: number,
  imageAmount: number
): gSolveReturn {
  const rChannel = channel[0]
  const gChannel = channel[1]
  const bChannel = channel[2]

  const { g: gRed, LE: LERed } = gSolveOneChannel(rChannel, shutterSpeed, smoothness, samples, imageAmount)
  const { g: gGreen, LE: LEGreen } = gSolveOneChannel(gChannel, shutterSpeed, smoothness, samples, imageAmount)
  const { g: gBlue, LE: LEBlue } = gSolveOneChannel(bChannel, shutterSpeed, smoothness, samples, imageAmount)

  return {
    gRed,
    LERed,
    gGreen,
    LEGreen,
    gBlue,
    LEBlue
  }
}

// export type image = [Matrix, Matrix, Matrix]

export function getActualRadiance (
  row: number,
  col: number,
  channels: Number,
  numImages: Number,
  images: [Matrix, Matrix, Matrix],
  radianceMaps: [Matrix, Matrix, Matrix],
  shutterSpeed: number[]

): Matrix[] {
  const d = Matrix.ones(row, col)
  const n = Matrix.zeros(row, col)
  const denominator = [d, d, d]
  const numerator = [n, n, n]

  const finalImages = [new Matrix(row, col), new Matrix(row, col), new Matrix(row, col)]

  for (let i = 0; i < numImages; i++) {
    const zij = images[i] // var of type Image
    // const gZij = zij // var of type Image

    // gZij[c] = (zij[c]).to1DArray().map((pixel) => radianceMaps[c].getColumn(pixel))
    // gZij[c] = gZij[c].sub(shutterSpeed[i])
    console.log(radianceMaps)
    let numberOfLogs = 0
    for (let c = 0; c < channels; c++) {
      for (let r = 0; r < row; r++) {
        for (let j = 0; j < col; j++) {
          zij.set(
            r,
            j,
            radianceMaps[c].get(0, zij.get(r, j)) - shutterSpeed[i]
          )

          // check if nan
          if (isNaN(radianceMaps[c].get(0, zij.get(r, j))) && numberOfLogs < 10) {
            console.log('nan', zij.get(r, j))
            numberOfLogs++
          }

          // apply weight
          // zij.set(
          //   r,
          //   j,
          //   weight(zij.get(r, j))
          // )
          // console.log(r, j, numerator[i].get(r, j) + weight(zij.get(r, j)) * zij.get(r, j))
          numerator[i].set(r, j, numerator[i].get(r, j) + weight(zij.get(r, j)) * zij.get(r, j))

          denominator[i].set(r, j, denominator[i].get(r, j) + weight(zij.get(r, j)))

          finalImages[i].set(r, j, numerator[i].get(r, j) / (denominator[i].get(r, j) + 1))
        }
      }

      // apply weight
      // zij[c] = new Matrix([zij[c].to1DArray().map(val => weight(val))])
      // const gZijArray = gZij[c].to1DArray()
      // const arr = zij[c].to1DArray().map(val => weight(val))
      // const mult = arr.map((z, i) => z * gZijArray[i])
      // finalImages[c] = (numerator[c].to1DArray().map((val, i) => val + mult[i])).map((val, i) => val / denominator[c].getColumn(i)[0])

      // numerator[c] = numerator[c].add(zij[c].mmul(g_zij[c].transpose()))
    }
  }
  return finalImages
}

export function ToneMapping (
  finalImage: [Matrix, Matrix, Matrix],
  channels: number
): void {
  for (let c = 0; c < channels; c++) {
    const mat = finalImage[c]
    const channelMax = Math.max(...mat.to1DArray())
    const channelMin = Math.min(...mat.to1DArray())

    finalImage[c] = Matrix.div(finalImage[c].add(Math.abs(channelMin)), (channelMax + Math.abs(channelMin)))
  }
}
