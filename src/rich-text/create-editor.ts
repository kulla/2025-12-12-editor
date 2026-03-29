import { type Awareness, Cursor } from 'loro-crdt'
import {
  type CursorAwareness,
  type LoroDocType,
  type LoroNodeMapping,
  updateLoroToPmState,
} from 'loro-prosemirror'
import {
  createEditor,
  defineBaseKeymap,
  defineKeymap,
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
import type { RichTextSchema } from '../schema'
import type { EditorStore } from '../store/editor-store'
import type { Key } from '../store/key'
import { createProxyWithChangedMethods } from '../utils/proxy'
import { isInline, RichTextFeature } from './types'

export function createRichTextEditor({
  key,
  schema,
  store,
  defaultContent,
}: {
  key: Key
  schema: RichTextSchema
  store: EditorStore
  defaultContent?: NodeJSON
}) {
  const { name, doc, awareness, color } = store.cdrt
  const containerId = doc.getMap(`prosemirror:${key}`).id
  const mapping: LoroNodeMapping = new Map()
  const extension = union(
    defineRichTextExtensions(schema.features),
    defineLoro({
      awareness: createEditorSpecificCursorAwareness(key, awareness),
      doc: doc as LoroDocType,
      sync: { containerId, mapping },
      cursor: { user: { name, color } },
    }),
  )
  const editor = createEditor({ extension, defaultContent })

  if (defaultContent != null) {
    updateLoroToPmState(doc as LoroDocType, mapping, editor.state, containerId)
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
          .filter(([_peer, state]) => hasEditorId(state, editorId))
          .map(([peer, state]) => [peer, decodeCursorState(state) ?? {}]),
      )
    },

    getLocal() {
      const state = awareness.getLocalState()

      return hasEditorId(state, editorId) ? decodeCursorState(state) : undefined
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

type CursorAwarenessState =
  CursorAwareness extends Awareness<infer T> ? T : never

function hasEditorId(
  state: object | undefined,
  editorId: Key,
): state is { editorId: Key } {
  return state != null && 'editorId' in state && state.editorId === editorId
}

function decodeCursorState(
  state?: CursorAwarenessState | null,
): ReturnType<CursorAwareness['getLocal']> {
  if (!state) return undefined

  return {
    anchor: state.anchor ? Cursor.decode(state.anchor) : null,
    focus: state.focus ? Cursor.decode(state.focus) : null,
    user: state.user ?? null,
  }
}

function defineDoc(features: Array<RichTextFeature>): Extension {
  const content = isInline(features) ? 'inlineBlock' : 'block+'

  return defineNodeSpec({ name: 'doc', content, topNode: true })
}

function defineInlineBlockNode() {
  return defineNodeSpec({
    name: 'inlineBlock',
    content: 'inline*',
    group: 'block',
    toDOM() {
      return ['span', { class: 'inline-rich-text' }, 0]
    },
  })
}

function defineRichTextExtensions(features: Array<RichTextFeature>): Extension {
  return union(
    defineDoc(features),
    defineText(),
    ...(isInline(features)
      ? [defineInlineBlockNode(), defineInlineKeymap()]
      : [defineBaseKeymap()]),
    ...features.map((feature) => createExtension(feature)),
  )
}

function defineInlineKeymap(): Extension {
  // Returning true consumes the event without action, preventing paragraph creation.
  return defineKeymap({ Enter: () => true })
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
