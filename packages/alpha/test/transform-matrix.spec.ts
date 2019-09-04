import { transformMatrix } from '@alpha/matrix'

describe('trasform matrix', () => {
  it('1', () => {
    expect(
      transformMatrix([[0, 0, 0, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0]]),
    ).toEqual([[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, 1, 1, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]])
  })
  it('2', () => {
    expect(
      transformMatrix([[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, 1, 1, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]),
    ).toEqual([[0, 0, 0, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0]])
  })
  it('3', () => {
    expect(
      transformMatrix([]),
    ).toEqual([])
  })
  it('4', () => {
    expect(
      transformMatrix(),
    ).toEqual([])
  })
  it('5', () => {
    expect(
      transformMatrix([[]]),
    ).toEqual([[]])
  })
  it('6', () => {
    expect(
      transformMatrix([[0,0,0,0],[0,1,1,0],[0,1,1,0],[0,0,0,0]]),
    ).toEqual([[0,0,0,0],[0,1,1,0],[0,1,1,0],[0,0,0,0]])
  })
})
