import type { Guard } from '../utils/guard'

export interface Schema<K extends SchemaKind = SchemaKind> {
  kind: K['kind']
  name: string
  isFlatValue: Guard<K['FlatValue']>
  [TypeInformation]?: {
    FlatValue: K['FlatValue']
    JSONValue: K['JSONValue']
  }
}

export type FlatValue<S extends Schema> = TypeInfo<S>['FlatValue']
export type JSONValue<S extends Schema> = TypeInfo<S>['JSONValue']

type TypeInfo<S extends Schema> = NonNullable<S[typeof TypeInformation]>

export type OmitTypeInformation<S extends Schema> = Omit<
  S,
  typeof TypeInformation
>

interface SchemaKind {
  kind: string
  FlatValue: unknown
  JSONValue: unknown
}

declare const TypeInformation: unique symbol
