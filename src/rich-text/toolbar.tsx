import { isMarkActive } from 'prosekit/core'
import { useEditor } from 'prosekit/react'
import type { ReactElement } from 'react'
import { RichTextFeature } from './types'

interface ToolbarProps {
  features: RichTextFeature[]
}

interface ToolbarCommands {
  toggleBold?: () => boolean
  toggleItalic?: () => boolean
}

export function Toolbar({ features }: ToolbarProps): ReactElement | null {
  const editor = useEditor({ update: true })
  const commands = editor.commands as ToolbarCommands

  const hasBold = features.includes(RichTextFeature.Bold)
  const hasItalic = features.includes(RichTextFeature.Italic)

  if (!hasBold && !hasItalic) {
    return null
  }

  const boldActive = hasBold && isMarkActive(editor.state, 'bold')
  const italicActive = hasItalic && isMarkActive(editor.state, 'italic')

  return (
    <div className="editor-toolbar">
      {hasBold && (
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
      )}
      {hasItalic && (
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
      )}
    </div>
  )
}
