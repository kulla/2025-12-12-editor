import type { LoroMap } from 'loro-crdt'
import {
  type LoroDocType,
  type LoroNodeMapping,
  updateLoroToPmState,
} from 'loro-prosemirror'
import { defineBasicExtension } from 'prosekit/basic'
import { createEditor, type NodeJSON, union } from 'prosekit/core'
import { defineLoro } from 'prosekit/extensions/loro'
import type { EditorStore } from '../store/editor-store'

export function createRichTextEditor({
  loroMap,
  store,
  defaultContent,
}: {
  loroMap: LoroMap
  store: EditorStore
  defaultContent?: NodeJSON
}) {
  const mapping: LoroNodeMapping = new Map()
  const extension = union(
    defineBasicExtension(),
    defineLoro({
      awareness: store.awareness,
      doc: store.loroDoc as LoroDocType,
      sync: { containerId: loroMap.id, mapping },
    }),
  )
  const editor = createEditor({ extension, defaultContent })

  if (defaultContent != null) {
    updateLoroToPmState(
      store.loroDoc as LoroDocType,
      mapping,
      editor.state,
      loroMap.id,
    )
  }

  return editor
}
