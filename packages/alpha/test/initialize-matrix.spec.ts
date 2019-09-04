import { Color, initializeMatrix } from "@alpha/matrix";

describe('initialize matrix', () => {
  it('1', () => {
    const matrix = initializeMatrix(10)

    expect(matrix).toHaveProperty('length')
    expect(matrix.length).toEqual(10)
    matrix.forEach(row => {
      expect(row).toHaveProperty('length')
      expect(row.length).toEqual(10)
      row.forEach(color => {
        expect(color).toBeGreaterThanOrEqual(Color.dead)
        expect(color).toBeLessThanOrEqual(Color.live)
      })
    })
  })
  it('2', () => {
    const matrix = initializeMatrix(0)

    expect(matrix).toHaveProperty('length')
    expect(matrix.length).toEqual(0)
    matrix.forEach(row => {
      expect(row).toHaveProperty('length')
      expect(row.length).toEqual(0)
      row.forEach(color => {
        expect(color).toBeGreaterThanOrEqual(Color.dead)
        expect(color).toBeLessThanOrEqual(Color.live)
      })
    })
  })
  it('3', () => {
    const matrix = initializeMatrix(1)

    expect(matrix).toHaveProperty('length')
    expect(matrix.length).toEqual(1)
    matrix.forEach(row => {
      expect(row).toHaveProperty('length')
      expect(row.length).toEqual(1)
      row.forEach(color => {
        expect(color).toBeGreaterThanOrEqual(Color.dead)
        expect(color).toBeLessThanOrEqual(Color.live)
      })
    })
  })
  it('4', () => {
    //@ts-ignore
    const matrix = initializeMatrix()

    expect(matrix).toHaveProperty('length')
    expect(matrix.length).toEqual(0)
    matrix.forEach(row => {
      expect(row).toHaveProperty('length')
      expect(row.length).toEqual(0)
      row.forEach(color => {
        expect(color).toBeGreaterThanOrEqual(Color.dead)
        expect(color).toBeLessThanOrEqual(Color.live)
      })
    })
  })
})
