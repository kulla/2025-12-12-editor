import type { Guard } from '../utils/guard'

export interface Schema<K extends SchemaKind = SchemaKind> {
  kind: K['kind']
  name: string
  isFlatValue: Guard<K['FlatValue']>
  [TypeInfo]?: {
    FlatValue: K['FlatValue']
    JSONValue: K['JSONValue']
  }
}

export type FlatValue<S extends Schema> = TypeInfo<S>['FlatValue']
export type JSONValue<S extends Schema> = TypeInfo<S>['JSONValue']

export type OmitTypeInfo<S extends Schema> = Omit<S, typeof TypeInfo>

type TypeInfo<S extends Schema> = NonNullable<S[typeof TypeInfo]>

interface SchemaKind {
  kind: string
  FlatValue: unknown
  JSONValue: unknown
}

declare const TypeInfo: unique symbol
