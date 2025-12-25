import type { ReactNode } from 'react'
import * as F from '../nodes/flat'
import type { EditorStore } from '../store/editor-store'

export function render(args: {
  node: F.FlatNode
  store: EditorStore
}): ReactNode {
  const { node, store } = args

  if (F.isLiteral(node)) {
    return String(node.value)
  } else if (F.isTruthValue(node)) {
  } else if (F.isRichText(node)) {
  } else if (F.isWrapper(node)) {
    return render({ store: store, node: F.getSingletonChild({ store, node }) })
  } else if (F.isUnion(node)) {
    return render({ store: store, node: F.getSingletonChild({ store, node }) })
  } else if (F.isArray(node)) {
    return (
      <div key={node.key}>
        {F.getItems({ store, node }).map((itemNode) =>
          render({ store, node: itemNode }),
        )}
      </div>
    )
  } else if (F.isObject(node)) {
  }

  return `[Unsupported node kind: ${node.schema.kind}]`
}
