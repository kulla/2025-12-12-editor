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
} from '../schema/kinds'
import type { FlatValue, Schema } from '../schema/types'
import type { Key } from '../store/key'
import type { Guard } from '../utils/guard'

export interface FlatNode<S extends Schema = Schema> {
  schema: S
  key: Key
  parentKey: Key | null
  value: FlatValue<S>
}

export const isTruthValue = createFlatNodeGuard(isTruthValueSchema)
export const isRichText = createFlatNodeGuard(isRichTextSchema)
export const isLiteral = createFlatNodeGuard(isLiteralSchema)
export const isWrapper = createFlatNodeGuard(isWrapperSchema)
export const isUnion = createFlatNodeGuard(isUnionSchema)
export const isArray = createFlatNodeGuard(isArraySchema)
export const isObject = createFlatNodeGuard(isObjectSchema)
export const isPrimitive = createFlatNodeGuard(isPrimitiveSchema)
export const isSingleton = createFlatNodeGuard(isSingletonSchema)

function createFlatNodeGuard<S extends Schema>(schemaGuard: Guard<S>) {
  return (node: FlatNode): node is FlatNode<S> => schemaGuard(node.schema)
}
