import type { Guard } from '../utils/guard'

export interface Schema<D extends SchemaDef = SchemaDef> {
  kind: D['kind']
  name: string
  isFlatValue: Guard<D['FlatValue']>
  [TypeInformation]?: {
    FlatValue: D['FlatValue']
    JSONValue: D['JSONValue']
  }
}

export type FlatValue<S extends Schema> = NonNullable<
  S[typeof TypeInformation]
>['FlatValue']

export type JSONValue<S extends Schema> = NonNullable<
  S[typeof TypeInformation]
>['JSONValue']

export type Arguments<S extends Schema> = Omit<
  S,
  'kind' | typeof TypeInformation | 'isFlatValue'
>

interface SchemaDef {
  kind: string
  FlatValue: unknown
  JSONValue: unknown
}

declare const TypeInformation: unique symbol
