import type { Editor } from 'prosekit/core'
import { ProseKit } from 'prosekit/react'
import type { ReactNode } from 'react'
import * as F from '../nodes/flat'
import * as S from '../schema'
import type { EditorStore } from '../store/editor-store'

export function render(args: {
  node: F.FlatNode
  store: EditorStore
}): ReactNode {
  const { node, store } = args

  if (S.hasCustomBehavior(node.schema) && node.schema.customBehavior.render) {
    return node.schema.customBehavior.render({
      store,
      node,
      renderChild: (childNode) => render({ store, node: childNode }),
    })
  } else if (F.isLiteral(node)) {
    return String(node.value)
  } else if (F.isTruthValue(node)) {
    return (
      <input key={node.key} type="checkbox" checked={node.value} readOnly />
    )
  } else if (F.isRichText(node)) {
    return <RichTextEditor key={node.key} editor={store.getEditor(node)} />
  } else if (F.isWrapper(node)) {
    return render({ store: store, node: F.getSingletonChild({ store, node }) })
  } else if (F.isUnion(node)) {
    return render({ store: store, node: F.getSingletonChild({ store, node }) })
  } else if (F.isArray(node) || F.isObject(node)) {
    const HTMLTag = node.schema.htmlTag ?? 'div'

    return (
      <HTMLTag key={node.key}>
        {F.getVisibleChildren({ store, node }).map((itemNode) =>
          render({ store, node: itemNode }),
        )}
      </HTMLTag>
    )
  }

  return `[Unsupported node kind: ${node.schema.kind}]`
}

function RichTextEditor({ editor }: { editor: Editor }) {
  return (
    <ProseKit editor={editor}>
      <div ref={editor.mount} />
    </ProseKit>
  )
}
