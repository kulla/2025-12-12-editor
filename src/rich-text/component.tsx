import type { LoroDocType } from 'loro-prosemirror'
import { defineBasicExtension } from 'prosekit/basic'
import { createEditor, union } from 'prosekit/core'
import { defineLoro } from 'prosekit/extensions/loro'
import { ProseKit } from 'prosekit/react'
import { useMemo } from 'react'
import type * as F from '../nodes/flat'
import type * as S from '../schema'
import type { EditorStore } from '../store/editor-store'

interface RichTextEditorProps {
  node: F.FlatNode<S.RichTextSchema>
  store: EditorStore
}

export function RichTextEditor({ node, store }: RichTextEditorProps) {
  const editor = useMemo(() => {
    const extension = union(
      defineBasicExtension(),
      defineLoro({
        doc: store.loroDoc as LoroDocType,
        sync: { containerId: node.value.id },
      }),
    )

    return createEditor({ extension })
  }, [store, node.value.id])

  return (
    <ProseKit editor={editor}>
      <div ref={editor.mount} />
    </ProseKit>
  )
}

export const DEFAULT_CONTENT_KEY = 'default-content' as const
