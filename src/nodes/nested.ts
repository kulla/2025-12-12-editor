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

export const isTruthValueNestedNode = createNestedNodeGuard(isTruthValueSchema)
export const isRichTextNestedNode = createNestedNodeGuard(isRichTextSchema)
export const isLiteralNestedNode = createNestedNodeGuard(isLiteralSchema)
export const isWrapperNestedNode = createNestedNodeGuard(isWrapperSchema)
export const isUnionNestedNode = createNestedNodeGuard(isUnionSchema)
export const isArrayNestedNode = createNestedNodeGuard(isArraySchema)
export const isObjectNestedNode = createNestedNodeGuard(isObjectSchema)
export const isPrimitiveNestedNode = createNestedNodeGuard(isPrimitiveSchema)
export const isSingletonNestedNode = createNestedNodeGuard(isSingletonSchema)

function createNestedNodeGuard<S extends Schema>(schemaGuard: Guard<S>) {
  return (node: NestedNode): node is NestedNode<S> => schemaGuard(node.schema)
}
