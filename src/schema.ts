declare const TypeInformation: unique symbol

export interface SchemaType {
  kind: string
  name: string
  [TypeInformation]: {
    FlatValue: unknown
    JSONValue: unknown
  }
}

export type FlatValue<S extends SchemaType> =
  S[typeof TypeInformation]['FlatValue']

export type JSONValue<S extends SchemaType> =
  S[typeof TypeInformation]['JSONValue']

