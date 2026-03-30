import { isMarkActive } from 'prosekit/core'
import { useEditor } from 'prosekit/react'
import type { ReactElement } from 'react'

interface ToolbarCommands {
  toggleBold?: () => boolean
  toggleItalic?: () => boolean
}

export function Toolbar(): ReactElement {
  const editor = useEditor({ update: true })
  const commands = editor.commands as ToolbarCommands

  const boldActive = isMarkActive(editor.state, 'bold')
  const italicActive = isMarkActive(editor.state, 'italic')

  return (
    <div className="editor-toolbar">
      <button
        type="button"
        aria-label="Bold"
        aria-pressed={boldActive}
        data-active={boldActive || undefined}
        onMouseDown={(e) => {
          e.preventDefault()
          commands.toggleBold?.()
        }}
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        aria-label="Italic"
        aria-pressed={italicActive}
        data-active={italicActive || undefined}
        onMouseDown={(e) => {
          e.preventDefault()
          commands.toggleItalic?.()
        }}
      >
        <em>I</em>
      </button>
    </div>
  )
}
