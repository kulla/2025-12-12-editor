export interface Iso<From, To> {
  to: (value: From) => To
  from: (value: To) => From
}

export function identityIso<T>(): Iso<T, T> {
  return {
    to: (value: T) => value,
    from: (value: T) => value,
  }
}
