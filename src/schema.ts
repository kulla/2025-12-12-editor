import { isKey, type Key } from './store/key'
import { type Guard, isBoolean, isString } from './utils/guard'

declare const TypeInformation: unique symbol

interface SchemaDef {
  kind: string
  FlatValue: unknown
  JSONValue: unknown
}

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

type Arguments<S extends Schema> = Omit<
  S,
  'kind' | typeof TypeInformation | 'isFlatValue'
>

function createSchemaGuard<S extends Schema>(kind: string): Guard<S> {
  return (value: unknown): value is S => {
    return (
      typeof value === 'object' &&
      value !== null &&
      'kind' in value &&
      value.kind === kind
    )
  }
}

interface BooleanSchema
  extends Schema<{
    kind: 'boolean'
    FlatValue: boolean
    JSONValue: boolean
  }> {}

export function createBooleanSchema(
  args: Arguments<BooleanSchema>,
): BooleanSchema {
  return { kind: 'boolean', isFlatValue: isBoolean, ...args }
}

export const isBooleanSchema = createSchemaGuard<BooleanSchema>('boolean')

interface StringSchema
  extends Schema<{
    kind: 'string'
    FlatValue: string
    JSONValue: string
  }> {}

export function createStringSchema(
  args: Arguments<StringSchema>,
): StringSchema {
  return { kind: 'string', isFlatValue: isString, ...args }
}

export const isStringSchema = createSchemaGuard<StringSchema>('string')

interface UnionSchema<S extends Schema[] = Schema[]>
  extends Schema<{
    kind: 'union'
    FlatValue: Key
    JSONValue: JSONValue<S[number]>
  }> {
  options: S
  getOption(value: JSONValue<S[number]>): S[number]
}

export function createUnionSchema<S extends Schema[]>(
  args: Arguments<UnionSchema<S>>,
): UnionSchema<S> {
  return { kind: 'union', isFlatValue: isKey, ...args }
}

export const isUnionSchema = createSchemaGuard<UnionSchema>('union')

const BooleanSchema = createBooleanSchema({ name: 'Boolean' })
const StringSchema = createStringSchema({ name: 'String' })
const UnionSchema = createUnionSchema({
  name: 'BooleanOrString',
  options: [BooleanSchema, StringSchema],
  getOption(value) {
    if (typeof value === 'boolean') {
      return BooleanSchema
    } else {
      return StringSchema
    }
  },
})

export type UnionJsonType = JSONValue<typeof UnionSchema>
