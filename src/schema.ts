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

type Arguments<S extends Schema> = Omit<
  S,
  'kind' | typeof TypeInformation | 'isFlatValue'
>

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
  create(args: Arguments<BooleanSchema>): BooleanSchema {
    return { kind: 'boolean', isFlatValue: Guard.boolean, ...args }
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
  create(args: Arguments<StringSchema>): StringSchema {
    return { kind: 'string', isFlatValue: Guard.string, ...args }
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
  create<S extends Schema[]>(args: Arguments<UnionSchema<S>>): UnionSchema<S> {
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
