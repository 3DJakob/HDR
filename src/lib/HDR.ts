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

// ImageR
// 1 2 3 4
// 5 6 7 8

// Image
//      firrst pixel ................... last pixel
// r        55                             24
// g        222                            45
// b        54                             200

// RadianceMap -> one channel
//          firrst image ................... last image
// sample1       23                             45
// sample2       68                             90
// .
// .
// .
// sample_last   111                             125

export function getActualRadiance (
  images: Matrix[],
  radianceMaps: [Matrix, Matrix, Matrix],
  shutterSpeed: number[]
): Matrix {
  const rows = images[0].rows
  const columns = images[0].columns
  const numImages = images.length
  // const channels = 3

  const denominator = Matrix.zeros(rows, columns)
  const numerator = Matrix.zeros(rows, columns)
  const arImage = Matrix.zeros(rows, columns)

  // for (let i = 0; i < numImages; i++) { // 1

  const wij = [Matrix.zeros(rows, columns), Matrix.zeros(rows, columns), Matrix.zeros(rows, columns)] // 3

  let numberOfLogs = 0
  const gZij = [Matrix.zeros(rows, columns), Matrix.zeros(rows, columns), Matrix.zeros(rows, columns)]

  for (let i = 0; i < numImages; i++) { // 3
    const zij = images[i] // 2
    // gZij.setRow(channel, radianceMaps[channel].sub(shutterSpeed[i])) // 4
    for (let column = 0; column < columns; column++) {
      for (let row = 0; row < rows; row++) {
        gZij[i].set(
          row,
          column,
          radianceMaps[i].get(0, images[i].get(row, column)) - shutterSpeed[i]
        ) // 4
      }
    }
  }

  // gZij = gZij.sub(shutterSpeed[i]) // 5

  // apply weight
  for (let channel = 0; channel < numImages; channel++) {
    for (let column = 0; column < columns; column++) {
      for (let row = 0; row < rows; row++) {
        wij[channel].set(row, column, weight(images[channel].get(row, column))) // 6
      }
    }
  }
  // numerator = numerator.add(wij.mul(zij)) // 7

  for (let channel = 0; channel < numImages; channel++) {
    for (let column = 0; column < columns; column++) {
      for (let row = 0; row < rows; row++) {
        // numerator[i].set(r, j, numerator[i].get(r, j) + weight(zij.get(r, j)) * zij.get(r, j))
        numerator.set(row, column, numerator.get(row, column) + wij[channel].get(row, column) * images[channel].get(row, column))
      }
    }
  }

  for (let channel = 0; channel < numImages; channel++) {
    denominator.add(wij[channel]) // 8
  }
  // }
  // arImage = numerator.div(denominator)
  // elementwise matrix division

  denominator.add(1)

  for (let column = 0; column < columns; column++) {
    for (let row = 0; row < rows; row++) {
      const newVal = numerator.get(row, column) / denominator.get(row, column)
      if (numberOfLogs < 10) {
        if (isNaN(newVal)) {
          console.warn('NaNs found in result!')
          numberOfLogs++
        }
      }
      arImage.set(row, column, newVal) // 9
    }
  }

  return arImage
}

// // check if nan
// if (isNaN(radianceMaps[c].get(0, zij.get(r, j))) && numberOfLogs < 10) {
//   console.log('nan', zij.get(r, j))
//   numberOfLogs++
// }

// apply weight
// zij.set(
//   r,
//   j,
//   weight(zij.get(r, j))
// )
// console.log(r, j, numerator[i].get(r, j) + weight(zij.get(r, j)) * zij.get(r, j))

// apply weight
// zij[c] = new Matrix([zij[c].to1DArray().map(val => weight(val))])
// const gZijArray = gZij[c].to1DArray()
// const arr = zij[c].to1DArray().map(val => weight(val))
// const mult = arr.map((z, i) => z * gZijArray[i])
// finalImages[c] = (numerator[c].to1DArray().map((val, i) => val + mult[i])).map((val, i) => val / denominator[c].getColumn(i)[0])

// numerator[c] = numerator[c].add(zij[c].mmul(g_zij[c].transpose()))

export function ToneMapping (
  img: [Matrix, Matrix, Matrix]
): [Matrix, Matrix, Matrix] {
  for (let c = 0; c < 3; c++) {
    const mat = img[c]

    const channelMax = mat.max()
    const channelMin = mat.min()
    img[c].apply((row, col) => {
      const val = mat.get(row, col)
      mat.set(row, col, (val + channelMin) / (channelMax + channelMin) * 255)
    })
  }
  return img
}
