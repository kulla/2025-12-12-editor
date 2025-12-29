import {
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
      awareness: store.awareness,
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
