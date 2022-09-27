import { SVD } from 'svd-js'
import { Matrix, solve } from 'ml-matrix'

// https://www.npmjs.com/package/ml-matrix

const matrix = Matrix.ones(5, 5)
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

interface image {
  r: number[]
  g: number[]
  b: number[]
}

const sampleImages: image[] = [
  {
    r: [255, 255, 255, 255],
    g: [255, 255, 255, 255],
    b: [255, 255, 255, 255]
  },
  {
    r: [100, 100, 100, 100],
    g: [100, 100, 100, 100],
    b: [100, 100, 100, 100]
  },
  {
    r: [0, 0, 0, 0],
    g: [0, 0, 0, 0],
    b: [0, 0, 0, 0]
  }
]

console.log(extractSampleValuesFromImages(sampleImages))

export function extractSampleValuesFromImages (images: image[]): [Matrix, Matrix, Matrix] {
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
  console.log(samples * imageAmount + n + 1)
  const A = Matrix.zeros(samples * imageAmount + n + 1, n + samples)
  const b = Matrix.zeros(A.rows, 1)

  // Data fitting Equation
  let k = 0
  for (let i = 0; i < samples; i++) {
    for (let j = 0; j < imageAmount; j++) {
      const wij = weight(Number(channel.get(i, j)) + 1)
      A.set(k, channel.get(i, j), wij)
      A.set(k, n + i, -wij)
      b.set(k, 1, wij * shutterSpeed[j])
      k = k + 1
    }
  }
  // Fix the curve by setting its middle value to 0
  A.set(k, 129, 1)
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
  const x = solve(A, b)

  const g = x.getColumn(0).slice(0, n)
  // g[0]
  const LE = x.getColumn(0).slice(n, x.columns)

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
