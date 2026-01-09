import { Cursor } from 'loro-crdt'
import {
  type CursorAwareness,
  type LoroDocType,
  type LoroNodeMapping,
  updateLoroToPmState,
} from 'loro-prosemirror'
import {
  createEditor,
  defineNodeSpec,
  type Extension,
  type NodeJSON,
  union,
} from 'prosekit/core'
import { defineBold } from 'prosekit/extensions/bold'
import { defineCode } from 'prosekit/extensions/code'
import { defineHeading } from 'prosekit/extensions/heading'
import { defineItalic } from 'prosekit/extensions/italic'
import { defineList } from 'prosekit/extensions/list'
import { defineLoro } from 'prosekit/extensions/loro'
import { defineParagraph } from 'prosekit/extensions/paragraph'
import { defineText } from 'prosekit/extensions/text'
import type * as F from '../nodes/flat'
import type { RichTextSchema } from '../schema'
import type { EditorStore } from '../store/editor-store'
import type { Key } from '../store/key'
import { createProxyWithChangedMethods } from '../utils/proxy'
import { isInline, RichTextFeature } from './types'

export function createRichTextEditor({
  node,
  store,
  defaultContent,
}: {
  node: F.FlatNode<RichTextSchema>
  store: EditorStore
  defaultContent?: NodeJSON
}) {
  const containerId = node.value.id
  const mapping: LoroNodeMapping = new Map()
  const extension = union(
    defineRichTextExtensions(node.schema.features),
    defineLoro({
      awareness: createEditorSpecificCursorAwareness(node.key, store.awareness),
      doc: store.loroDoc as LoroDocType,
      sync: { containerId, mapping },
    }),
  )
  const editor = createEditor({ extension, defaultContent })

  if (defaultContent != null) {
    updateLoroToPmState(
      store.loroDoc as LoroDocType,
      mapping,
      editor.state,
      containerId,
    )
  }

  return editor
}

function createEditorSpecificCursorAwareness(
  editorId: Key,
  awareness: CursorAwareness,
): CursorAwareness {
  return createProxyWithChangedMethods(awareness, {
    getAll() {
      return Object.fromEntries(
        Object.entries(awareness.getAllStates())
          .filter(
            ([_peer, state]) =>
              'editorId' in state && state.editorId === editorId,
          )
          .map(([peer, state]) => [
            peer,
            {
              anchor: state.anchor ? Cursor.decode(state.anchor) : undefined,
              focus: state.focus ? Cursor.decode(state.focus) : undefined,
              user: state.user ? state.user : undefined,
            },
          ]),
      )
    },

    getLocal() {
      const state = awareness.getLocal()

      if (state && 'editorId' in state && state.editorId !== editorId) {
        return undefined
      }

      return state
    },

    setLocal: (state: {
      anchor?: Cursor
      focus?: Cursor
      user?: { name?: string; color?: string }
    }) => {
      awareness.setLocalState({
        editorId,
        anchor: state.anchor?.encode() || null,
        focus: state.focus?.encode() || null,
        user: state.user || null,
      } as Parameters<CursorAwareness['setLocalState']>[0])
    },
  })
}

function defineDoc(features: Array<RichTextFeature>): Extension {
  const content = isInline(features) ? 'inline*' : 'block+'

  return defineNodeSpec({ name: 'doc', content, topNode: true })
}

function defineRichTextExtensions(features: Array<RichTextFeature>): Extension {
  return union(
    defineDoc(features),
    defineText(),
    ...features.map((feature) => createExtension(feature)),
  )
}

function createExtension(feature: RichTextFeature): Extension {
  switch (feature) {
    case RichTextFeature.Bold:
      return defineBold()
    case RichTextFeature.Italic:
      return defineItalic()
    case RichTextFeature.Blank:
      // TODO: Define Blank Extension
      return defineCode()
    case RichTextFeature.Paragraph:
      return defineParagraph()
    case RichTextFeature.Heading:
      return defineHeading()
    case RichTextFeature.List:
      return defineList()
  }
}
