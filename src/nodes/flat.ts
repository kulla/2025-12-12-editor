import type { FlatValue, Schema } from '../schema/types'
import type { Key } from '../store/key'
import type { Guard } from '../utils/guard'

export interface FlatNode<S extends Schema = Schema> {
  schema: S
  key: Key
  parentKey: Key | null
  value: FlatValue<S>
}

export function isFlatNodeKind<S extends Schema>(
  schemaGuard: Guard<S>,
  node: FlatNode,
): node is FlatNode<S> {
  return schemaGuard(node.schema)
}
