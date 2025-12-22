import {Guard} from "./utils"

declare const TypeInformation: unique symbol

interface SchemaDef {
  kind: string
  FlatValue: unknown
  JSONValue: unknown
}

export interface Schema<D extends SchemaDef = SchemaDef> {
  kind: D['kind']
  name: string
  [TypeInformation]?: {
    FlatValue: D['FlatValue']
    JSONValue: D['JSONValue']
  }
  isFlatValue: Guard.Guard<D['FlatValue']>
}

export type FlatValue<S extends Schema> =
  NonNullable<S[typeof TypeInformation]>['FlatValue']

export type JSONValue<S extends Schema> =
  NonNullable<S[typeof TypeInformation]>['JSONValue']

interface BooleanSchema extends Schema<{
  kind: 'boolean'
  FlatValue: boolean
  JSONValue: boolean
}> {}

export const boolean = {
  create(): BooleanSchema {
    return {
      kind: 'boolean',
      name: 'Boolean',
      isFlatValue: (value: unknown): value is boolean =>
        typeof value === 'boolean',
    }
  },
  is: (value: unknown): value is BooleanSchema => {
    return (
      typeof value === 'object' &&
      value !== null &&
      (value as Schema).kind === 'boolean'
    )
  }
}
