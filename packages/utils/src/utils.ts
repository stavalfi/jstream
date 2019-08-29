let x = 0
function id() {
  x++
  return `${x}`
}

// it's *much* easier to debug this file with shorter id's
// export const uuid: () => string = __DEV__ ? id : require('uuid/v4')
export const uuid: () => string = id

export const mapIf = <T, U>(
  predicate: (element: T, index: number, array: T[]) => any,
  mapper: (element: T, index: number, array: T[]) => U,
) => (element: T, index: number, array: T[]) => {
  if (predicate(element, index, array)) {
    return mapper(element, index, array)
  }
  return element
}

export const toArray = <T>(param: T | T[]): T[] => (Array.isArray(param) ? param : [param])

export const removeProp = <T extends { [prop: string]: any }>(obj: T, ...properties: string[]): T => {
  const copy = { ...obj }
  properties.forEach(prop => delete copy[prop])
  return copy
}
