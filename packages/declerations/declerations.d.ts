declare module 'is-promise' {
  export default function<T>(obj: any): obj is PromiseLike<T>
}
