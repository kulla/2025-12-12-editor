import { isKey, type Key } from './store/key'
import { Guard } from './utils'

declare const TypeInformation: unique symbol

interface SchemaDef {
  kind: string
  FlatValue: unknown
  JSONValue: unknown
}

export interface Schema<D extends SchemaDef = SchemaDef> {
  kind: D['kind']
  name: string
  isFlatValue: Guard.Guard<D['FlatValue']>
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

function createSchemaGuard<S extends Schema>(kind: string): Guard.Guard<S> {
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

export const boolean = {
  create({ name }: { name: string }): BooleanSchema {
    return { kind: 'boolean', name, isFlatValue: Guard.boolean }
  },
  is: createSchemaGuard<BooleanSchema>('boolean'),
}

interface StringSchema
  extends Schema<{
    kind: 'string'
    FlatValue: string
    JSONValue: string
  }> {}

export const string = {
  create({ name }: { name: string }): StringSchema {
    return { kind: 'string', name, isFlatValue: Guard.string }
  },
  is: createSchemaGuard<StringSchema>('string'),
}

interface UnionSchema<S extends Schema[] = Schema[]>
  extends Schema<{
    kind: 'union'
    FlatValue: Key
    JSONValue: JSONValue<S[number]>
  }> {
  options: S
  getOption(value: JSONValue<S[number]>): S[number]
}

export const union = {
  create<S extends Schema[]>(args: {
    name: string
    options: S
    getOption(value: JSONValue<S[number]>): S[number]
  }): UnionSchema<S> {
    return { kind: 'union', isFlatValue: isKey, ...args }
  },
  is: createSchemaGuard<UnionSchema>('union'),
}

const BooleanSchema = boolean.create({ name: 'Boolean' })
const StringSchema = string.create({ name: 'String' })
const UnionSchema = union.create({
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
