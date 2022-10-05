import Matrix from 'ml-matrix'

export const ArrayToMatrix = (arr: Uint8Array, width: number, height: number): Matrix => {
  const matrix = new Matrix(height, width)
  let index = 0
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      matrix.set(i, j, arr[index])
      index++
    }
  }
  return matrix
}
