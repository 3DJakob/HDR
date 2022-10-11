import { Matrix, solve } from 'ml-matrix'
import { ArrayToMatrix } from './ArrayToMatrix'

export function weight (x: number): number {
  let out = 0
  if (x < (255 / 2)) {
    out = x
  } else {
    out = 255 - x
  }

  return out
}

export interface Image {
  r: Uint8Array
  g: Uint8Array
  b: Uint8Array
  width: number
  height: number
}

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

export function getActualRadiance (
  images: Matrix[],
  radianceMaps: [Matrix, Matrix, Matrix],
  shutterSpeed: number[]
): Matrix {
  const rows = images[0].rows
  const columns = images[0].columns
  const numImages = images.length

  const denominator = Matrix.zeros(rows, columns)
  const numerator = Matrix.zeros(rows, columns)
  const arImage = Matrix.zeros(rows, columns)
  const wij = [Matrix.zeros(rows, columns), Matrix.zeros(rows, columns), Matrix.zeros(rows, columns)] // 3

  let numberOfLogs = 0
  const gZij = [Matrix.zeros(rows, columns), Matrix.zeros(rows, columns), Matrix.zeros(rows, columns)]

  // 4
  for (let i = 0; i < numImages; i++) { // 3
    for (let column = 0; column < columns; column++) {
      for (let row = 0; row < rows; row++) {
        gZij[i].set(
          row,
          column,
          radianceMaps[i].get(0, images[i].get(row, column)) - shutterSpeed[i]
        )
      }
    }
  }

  // 5
  // apply weight
  for (let channel = 0; channel < numImages; channel++) {
    for (let column = 0; column < columns; column++) {
      for (let row = 0; row < rows; row++) {
        wij[channel].set(row, column, weight(images[channel].get(row, column))) // 6
      }
    }
  }

  // 7
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

export function HDRMerge (images: [Image, Image, Image]): Image {
  const samples = extractSampleValuesFromImages(images)
  const shutterSpeeds = [Math.log(1 / 400), Math.log(1 / 125), Math.log(1 / 20)]
  const g = gsolveImage(samples, shutterSpeeds, 100, 10, samples.length)

  const r1Matrix = ArrayToMatrix(images[0].r, images[0].width, images[0].height)
  const r2Matrix = ArrayToMatrix(images[1].r, images[1].width, images[1].height)
  const r3Matrix = ArrayToMatrix(images[2].r, images[2].width, images[2].height)

  const b1Matrix = ArrayToMatrix(images[0].b, images[0].width, images[0].height)
  const b2Matrix = ArrayToMatrix(images[1].b, images[1].width, images[1].height)
  const b3Matrix = ArrayToMatrix(images[2].b, images[2].width, images[2].height)

  const g1Matrix = ArrayToMatrix(images[0].g, images[0].width, images[0].height)
  const g2Matrix = ArrayToMatrix(images[1].g, images[1].width, images[1].height)
  const g3Matrix = ArrayToMatrix(images[2].g, images[2].width, images[2].height)

  const radianceMaps: [Matrix, Matrix, Matrix] = [
    new Matrix([g.gRed]),
    new Matrix([g.gGreen]),
    new Matrix([g.gBlue])
  ]

  const red = getActualRadiance([r1Matrix, r2Matrix, r3Matrix], radianceMaps, shutterSpeeds)
  const blue = getActualRadiance([b1Matrix, b2Matrix, b3Matrix], radianceMaps, shutterSpeeds)
  const green = getActualRadiance([g1Matrix, g2Matrix, g3Matrix], radianceMaps, shutterSpeeds)

  const img = ToneMapping([red, green, blue])

  const image: Image = {
    r: new Uint8Array(img[0].to1DArray()),
    g: new Uint8Array(img[1].to1DArray()),
    b: new Uint8Array(img[2].to1DArray()),
    width: images[0].width,
    height: images[0].height
  }
  return image
}
