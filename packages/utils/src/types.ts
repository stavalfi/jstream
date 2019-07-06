// https://stackoverflow.com/questions/56877697/get-all-combinations-of-a-type/56877972#56877972
// limitation: it does not work for recursive types and it will throw errors on other types that use your type.
// for more details, read my comment there.
export type Combinations<T extends {}> =
  | {
      [K in keyof T]: Combinations<Omit<T, K>> | Pick<T, K>
    }[keyof T]
  | {}
