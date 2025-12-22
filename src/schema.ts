import type { LoroList, LoroMap } from 'loro-crdt'
import { isKey, type Key } from './store/key'
import { type Guard, isBoolean, isUnion } from './utils/guard'
import type { Iso } from './utils/iso'
import { isLoroList, isLoroMap } from './utils/loro'

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

interface RichTextSchema
  extends Schema<{
    kind: 'richText'
    FlatValue: LoroMap
    JSONValue: string
  }> {}

interface WrapperSchema<S extends Schema = Schema, J = JSONValue<S>>
  extends Schema<{
    kind: 'wrapper'
    FlatValue: Key
    JSONValue: J
  }> {
  wrappedSchema: S
  wrapIso: Iso<JSONValue<S>, J>
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

interface ArraySchema<S extends Schema = Schema>
  extends Schema<{
    kind: 'array'
    FlatValue: LoroList<Key>
    JSONValue: JSONValue<S>[]
  }> {
  itemSchema: S
}

interface ObjectSchema<
  P extends Record<string, Schema> = Record<string, Schema>,
> extends Schema<{
    kind: 'object'
    FlatValue: LoroMap<{ [K in keyof P]: Key }>
    JSONValue: { [K in keyof P]: JSONValue<P[K]> }
  }> {
  properties: P
  keyOrder: (keyof P)[]
}

export function createBooleanSchema(
  args: Arguments<BooleanSchema>,
): BooleanSchema {
  return { kind: 'boolean', isFlatValue: isBoolean, ...args }
}

export function createRichTextSchema(
  args: Arguments<RichTextSchema>,
): RichTextSchema {
  return { kind: 'richText', isFlatValue: isLoroMap, ...args }
}

export function createWrapperSchema<S extends Schema, J = JSONValue<S>>(
  args: Arguments<WrapperSchema<S, J>>,
): WrapperSchema<S, J> {
  return { kind: 'wrapper', isFlatValue: isKey, ...args }
}

export function createUnionSchema<S extends Schema[]>(
  args: Arguments<UnionSchema<S>>,
): UnionSchema<S> {
  return { kind: 'union', isFlatValue: isKey, ...args }
}

export function createArraySchema<S extends Schema>(
  args: Arguments<ArraySchema<S>>,
): ArraySchema<S> {
  return {
    kind: 'array',
    isFlatValue(value): value is LoroList<Key> {
      return isLoroList(value) && value.toArray().every(isKey)
    },
    ...args,
  }
}

export function createObjectSchema<Props extends Record<string, Schema>>(
  args: Arguments<ObjectSchema<Props>>,
): ObjectSchema<Props> {
  return {
    kind: 'object',
    isFlatValue(value): value is LoroMap<{ [K in keyof Props]: Key }> {
      return isLoroMap(value) && value.values().every(isKey)
    },
    ...args,
  }
}

export const isBooleanSchema = createSchemaGuard<BooleanSchema>('boolean')
export const isRichTextSchema = createSchemaGuard<RichTextSchema>('string')
export const isWrapperSchema = createSchemaGuard<WrapperSchema>('wrapper')
export const isUnionSchema = createSchemaGuard<UnionSchema>('union')
export const isArraySchema = createSchemaGuard<ArraySchema>('array')
export const isObjectSchema = createSchemaGuard<ObjectSchema>('object')

export const isPrimitiveSchema = isUnion(isBooleanSchema, isRichTextSchema)
export const isSingletonSchema = isUnion(isWrapperSchema, isUnionSchema)
