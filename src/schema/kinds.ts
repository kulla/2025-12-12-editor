import type { LoroList, LoroMap } from 'loro-crdt'
import { isKey, type Key } from '../store/key'
import { type Guard, isBoolean, isUnion } from '../utils/guard'
import type { Iso } from '../utils/iso'
import { isLoroList, isLoroMap } from '../utils/loro'
import type { JSONValue, OmitTypeInformation, Schema } from './types'

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

interface UnionSchema<S extends readonly Schema[] = readonly Schema[]>
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
  properties: Readonly<P>
  keyOrder: readonly (keyof P)[]
}

export function createBooleanSchema(
  args: FactoryArguments<BooleanSchema>,
): BooleanSchema {
  return { kind: 'boolean', isFlatValue: isBoolean, ...args }
}

export function createRichTextSchema(
  args: FactoryArguments<RichTextSchema>,
): RichTextSchema {
  return { kind: 'richText', isFlatValue: isLoroMap, ...args }
}

export function createWrapperSchema<S extends Schema, J = JSONValue<S>>(
  args: FactoryArguments<WrapperSchema<S, J>>,
): WrapperSchema<S, J> {
  return { kind: 'wrapper', isFlatValue: isKey, ...args }
}

export function createUnionSchema<S extends readonly Schema[]>(
  args: FactoryArguments<UnionSchema<S>>,
): UnionSchema<S> {
  return { kind: 'union', isFlatValue: isKey, ...args }
}

export function createArraySchema<S extends Schema>(
  args: FactoryArguments<ArraySchema<S>>,
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
  args: FactoryArguments<ObjectSchema<Props>>,
): ObjectSchema<Props> {
  const propertyNames = Object.keys(args.properties)

  if (propertyNames.length === 0) {
    throw new Error('Object schema must have at least one property')
  }
  if (new Set(propertyNames).size !== propertyNames.length) {
    throw new Error('Property names in object schema must be unique')
  }
  if (!propertyNames.every((name) => args.keyOrder.includes(name))) {
    throw new Error(
      'All property names must be included in keyOrder of object schema',
    )
  }

  return {
    kind: 'object',
    isFlatValue(value): value is LoroMap<{ [K in keyof Props]: Key }> {
      return isLoroMap(value) && value.values().every(isKey)
    },
    ...args,
  }
}

type FactoryArguments<S extends Schema> = Omit<
  OmitTypeInformation<S>,
  'kind' | 'isFlatValue'
>

export const isBooleanSchema = createSchemaGuard<BooleanSchema>('boolean')
export const isRichTextSchema = createSchemaGuard<RichTextSchema>('richText')
export const isWrapperSchema = createSchemaGuard<WrapperSchema>('wrapper')
export const isUnionSchema = createSchemaGuard<UnionSchema>('union')
export const isArraySchema = createSchemaGuard<ArraySchema>('array')
export const isObjectSchema = createSchemaGuard<ObjectSchema>('object')

export const isPrimitiveSchema = isUnion(isBooleanSchema, isRichTextSchema)
export const isSingletonSchema = isUnion(isWrapperSchema, isUnionSchema)

function createSchemaGuard<S extends Schema>(kind: S['kind']): Guard<S> {
  return (value: unknown): value is S => {
    return (
      typeof value === 'object' &&
      value !== null &&
      'kind' in value &&
      value.kind === kind
    )
  }
}
