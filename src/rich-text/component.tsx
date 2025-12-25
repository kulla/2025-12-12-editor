import {
  type LoroDocType,
  type LoroNodeMapping,
  updateLoroToPmState,
} from 'loro-prosemirror'
import { defineBasicExtension } from 'prosekit/basic'
import { createEditor, union } from 'prosekit/core'
import { defineLoro } from 'prosekit/extensions/loro'
import { ProseKit } from 'prosekit/react'
import { useMemo } from 'react'
import type * as F from '../nodes/flat'
import type * as S from '../schema'
import type { EditorStore } from '../store/editor-store'
import { RichTextProperty } from './types'

interface RichTextEditorProps {
  node: F.FlatNode<S.RichTextSchema>
  store: EditorStore
}

export function RichTextEditor({ node, store }: RichTextEditorProps) {
  // biome-ignore lint: react-hooks-deps
  const editor = useMemo(() => {
    const mapping: LoroNodeMapping = new Map()
    const containerId = node.value.get(RichTextProperty.Content).id
    const defaultContent = node.value.get(RichTextProperty.DefaultContent)

    const extension = union(
      defineBasicExtension(),
      defineLoro({
        awareness: store.awareness,
        doc: store.loroDoc as LoroDocType,
        sync: { containerId, mapping },
      }),
    )

    const editor = createEditor({ extension, defaultContent })

    updateLoroToPmState(
      store.loroDoc as LoroDocType,
      mapping,
      editor.state,
      containerId,
    )

    return editor
  }, [store, node.key])

  return (
    <ProseKit editor={editor}>
      <div ref={editor.mount} />
    </ProseKit>
  )
}
