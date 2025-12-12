type Schema<T extends keyof SchemaDefinitions> = SchemaType & {
  kind: T
  [TypeInformation]: SchemaDefinitions[T]
}

interface SchemaDefinitions {
  boolean: {
    FlatValue: boolean
    JSONValue: boolean
  }
  string: {
    FlatValue: string
    JSONValue: string
  }
  union: {
    FlatValue: unknown
    JSONValue: unknown
  }
}

export interface SchemaType {
  kind: string
  name: string
  [TypeInformation]: {
    FlatValue: unknown
    JSONValue: unknown
  }
}

declare const TypeInformation: unique symbol
