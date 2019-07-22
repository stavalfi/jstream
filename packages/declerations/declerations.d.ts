declare module 'is-promise' {
  export default function<T>(obj: any): obj is Promise<T>
}

declare const __DEV__: boolean
