export interface Iso<From, To> {
  to: (value: From) => To
  from: (value: To) => From
}
