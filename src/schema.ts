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

