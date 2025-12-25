import * as S from '../schema'
import type { Key } from '../store/key'
import type { Guard } from '../utils/guard'

export interface FlatNode<S extends S.Schema = S.Schema> {
  schema: S
  key: Key
  parentKey: Key | null
  value: S.FlatValue<S>
}

export const isTruthValue = createFlatNodeGuard(S.isTruthValueSchema)
export const isRichText = createFlatNodeGuard(S.isRichTextSchema)
export const isLiteral = createFlatNodeGuard(S.isLiteralSchema)
export const isWrapper = createFlatNodeGuard(S.isWrapperSchema)
export const isUnion = createFlatNodeGuard(S.isUnionSchema)
export const isArray = createFlatNodeGuard(S.isArraySchema)
export const isObject = createFlatNodeGuard(S.isObjectSchema)
export const isPrimitive = createFlatNodeGuard(S.isPrimitiveSchema)
export const isSingleton = createFlatNodeGuard(S.isSingletonSchema)

function createFlatNodeGuard<S extends S.Schema>(schemaGuard: Guard<S>) {
  return (node: FlatNode): node is FlatNode<S> => schemaGuard(node.schema)
}
