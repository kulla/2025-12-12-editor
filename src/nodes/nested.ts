import {
  type ArraySchema,
  isArraySchema,
  isLiteralSchema,
  isObjectSchema,
  isPrimitiveSchema,
  isRichTextSchema,
  isSingletonSchema,
  isTruthValueSchema,
  isUnionSchema,
  isWrapperSchema,
  type ObjectSchema,
  type UnionSchema,
  type WrapperSchema,
} from '../schema'
import type { JSONValue, Schema } from '../schema/types'
import type { Guard } from '../utils/guard'

export interface NestedNode<S extends Schema = Schema> {
  schema: S
  value: JSONValue<S>
}

export function unwrap({ schema, value }: NestedNode<WrapperSchema>) {
  return { schema: schema.wrappedSchema, value: schema.unwrap(value) }
}

export function getOption({ schema, value }: NestedNode<UnionSchema>) {
  return { schema: schema.getOption(value), value }
}

export function getItems({ schema, value }: NestedNode<ArraySchema>) {
  return value.map((itemValue) => {
    return { schema: schema.itemSchema, value: itemValue }
  })
}

export function getProperty(
  { schema, value }: NestedNode<ObjectSchema>,
  key: string,
) {
  return { schema: schema.properties[key], value: value[key] }
}

export const isTruthValue = createNestedNodeGuard(isTruthValueSchema)
export const isRichText = createNestedNodeGuard(isRichTextSchema)
export const isLiteral = createNestedNodeGuard(isLiteralSchema)
export const isWrapper = createNestedNodeGuard(isWrapperSchema)
export const isUnion = createNestedNodeGuard(isUnionSchema)
export const isArray = createNestedNodeGuard(isArraySchema)
export const isObject = createNestedNodeGuard(isObjectSchema)
export const isPrimitive = createNestedNodeGuard(isPrimitiveSchema)
export const isSingleton = createNestedNodeGuard(isSingletonSchema)

function createNestedNodeGuard<S extends Schema>(schemaGuard: Guard<S>) {
  return (node: NestedNode): node is NestedNode<S> => schemaGuard(node.schema)
}
