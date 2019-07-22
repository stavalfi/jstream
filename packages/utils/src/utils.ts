let x = 0
function id() {
  x++
  return `${x}`
}

// it's *much* easier to debug this file with shorter id's
export const uuid = __DEV__ ? id : require('uuid/v4')
