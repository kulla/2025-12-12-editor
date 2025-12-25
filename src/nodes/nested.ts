import {
  isArraySchema,
  isLiteralSchema,
  isObjectSchema,
  isPrimitiveSchema,
  isRichTextSchema,
  isSingletonSchema,
  isTruthValueSchema,
  isUnionSchema,
  isWrapperSchema,
  type WrapperSchema,
} from '../schema/kinds'
import type { JSONValue, Schema } from '../schema/types'
import type { Guard } from '../utils/guard'

export interface NestedNode<S extends Schema = Schema> {
  schema: S
  value: JSONValue<S>
}

export function unwrap({
  schema,
  value,
}: NestedNode<WrapperSchema>): NestedNode {
  return { schema: schema.wrappedSchema, value: schema.unwrap(value) }
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
