import type { Editor } from 'prosekit/core'
import { ProseKit } from 'prosekit/react'

export function RichTextEditor({ editor }: { editor: Editor }) {
  return (
    <ProseKit editor={editor}>
      <div ref={editor.mount} />
    </ProseKit>
  )
}
