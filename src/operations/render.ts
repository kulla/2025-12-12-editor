import type { ReactNode } from 'react'
import * as F from '../nodes/flat'
import type { EditorStore } from '../store/editor-store'

export function render({
  node,
  store,
}: {
  node: F.FlatNode
  store: EditorStore
}): ReactNode {
  if (F.isLiteral(node)) {
    return String(node.value)
  } else if (F.isTruthValue(node)) {
  }

  return `[Unsupported node kind: ${node.schema.kind}]`
}
