import * as S from '../schema'
import type { Key } from '../store/key'
import type { Guard } from '../utils/guard'

export interface FlatNode<S extends S.Schema = S.Schema> {
  schema: S
  key: Key
  parentKey: Key | null
  value: S.FlatValue<S>
}

export const isTruthValue = createFlatNodeGuard(S.isTruthValue)
export const isRichText = createFlatNodeGuard(S.isRichText)
export const isLiteral = createFlatNodeGuard(S.isLiteral)
export const isWrapper = createFlatNodeGuard(S.isWrapper)
export const isUnion = createFlatNodeGuard(S.isUnion)
export const isArray = createFlatNodeGuard(S.isArray)
export const isObject = createFlatNodeGuard(S.isObject)
export const isPrimitive = createFlatNodeGuard(S.isPrimitive)
export const isLeaf = createFlatNodeGuard(S.isLeaf)
export const isSingleton = createFlatNodeGuard(S.isSingletonSchema)

function createFlatNodeGuard<S extends S.Schema>(schemaGuard: Guard<S>) {
  return (node: FlatNode): node is FlatNode<S> => schemaGuard(node.schema)
}
