import Matrix from 'ml-matrix'

export const ArrayToMatrix = (arr: Uint8Array, width: number, height: number): Matrix => {
  const matrix = new Matrix(height, width)
  let index = 0

  matrix.apply((row, column) => {
    matrix.set(row, column, arr[index])
    index++
  })
  return matrix
}
