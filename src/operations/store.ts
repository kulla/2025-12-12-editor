import { LoroMap } from 'loro-crdt'
import {
  isPrimitiveNestedNode,
  isRichTextNestedNode,
  isWrapperNestedNode,
  type NestedNode,
  unwrap,
} from '../nodes/nested'
import { DEFAULT_CONTENT_KEY } from '../rich-text/create-editor'
import type { Transaction } from '../store/editor-store'
import type { Key } from '../store/key'

export function store(args: {
  tx: Transaction
  parentKey: Key
  node: NestedNode
}): Key {
  const { tx, parentKey, node } = args

  if (isRichTextNestedNode(node)) {
    const map = new LoroMap()

    map.set(DEFAULT_CONTENT_KEY, node.value)

    return tx.insert(node.schema, parentKey, () => map)
  } else if (isPrimitiveNestedNode(node)) {
    return tx.insert(node.schema, parentKey, () => node.value)
  } else if (isWrapperNestedNode(node)) {
    return tx.insert(node.schema, parentKey, () =>
      store({ tx, parentKey, node: unwrap(node) }),
    )
  } else {
    throw new Error(`Unsupported schema kind: ${node.schema.kind}`)
  }
}
