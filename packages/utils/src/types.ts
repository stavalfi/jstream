export type Combinations<T> =
  | {
      [K in keyof T]: Combinations<Omit<T, K>> | Pick<T, K>
    }[keyof T]
  | T
  | {}
