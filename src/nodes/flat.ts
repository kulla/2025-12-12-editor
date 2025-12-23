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

export const isTruthValueFlatNode = createFlatNodeGuard(isTruthValueSchema)
export const isRichTextFlatNode = createFlatNodeGuard(isRichTextSchema)
export const isLiteralFlatNode = createFlatNodeGuard(isLiteralSchema)
export const isWrapperFlatNode = createFlatNodeGuard(isWrapperSchema)
export const isUnionFlatNode = createFlatNodeGuard(isUnionSchema)
export const isArrayFlatNode = createFlatNodeGuard(isArraySchema)
export const isObjectFlatNode = createFlatNodeGuard(isObjectSchema)
export const isPrimitiveFlatNode = createFlatNodeGuard(isPrimitiveSchema)
export const isSingletonFlatNode = createFlatNodeGuard(isSingletonSchema)

function createFlatNodeGuard<S extends Schema>(schemaGuard: Guard<S>) {
  return (node: FlatNode): node is FlatNode<S> => schemaGuard(node.schema)
}
