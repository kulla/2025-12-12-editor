import type { Key } from './store/key'

export type FlatValue<S extends SchemaType> =
  S[typeof TypeInformation]['FlatValue']

export type JSONValue<S extends SchemaType> =
  S[typeof TypeInformation]['JSONValue']

interface UnionSchema<Options extends SchemaType[] = SchemaType[]>
  extends SchemaType {
  kind: 'union'
  options: Options
  [TypeInformation]: {
    FlatValue: Key
    JSONValue: JSONValue<Options[number]>
  }
}

interface StringSchema extends SchemaType {
  kind: 'string'
  [TypeInformation]: {
    FlatValue: string
    JSONValue: string
  }
}

interface BooleanSchema extends SchemaType {
  kind: 'boolean'
  [TypeInformation]: {
    FlatValue: boolean
    JSONValue: boolean
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
