let x = 0
function id() {
  x++
  return `${x}`
}

// it's *much* easier to debug this file with shorter id's
export const uuid = __DEV__ ? id : require('uuid/v4')

export const mapIf = <T, U>(
  predicate: (element: T, index: number, array: T[]) => any,
  mapper: (element: T, index: number, array: T[]) => U,
) => (element: T, index: number, array: T[]) => {
  if (predicate(element, index, array)) {
    return mapper(element, index, array)
  }
  return element
}
