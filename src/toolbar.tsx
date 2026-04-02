import type { CommandAction, Editor } from 'prosekit/core'
import type { MouseEvent } from 'react'
import { isRichText } from './nodes/flat'
import { RichTextFeature } from './rich-text/types'
import type { EditorStore } from './store/editor-store'

interface ToolbarProps {
  store: EditorStore
}

interface ToolbarButtonState {
  disabled: boolean
  pressed: boolean
  command?: () => void
}

interface ToolbarContext {
  features: ReadonlyArray<RichTextFeature>
  editor: Editor
}

export function Toolbar({ store }: ToolbarProps) {
  const context = createToolbarContext(store)

  const bold = getButtonState({
    context,
    feature: RichTextFeature.Bold,
    commandName: 'toggleBold',
    markName: 'bold',
  })

  const italic = getButtonState({
    context,
    feature: RichTextFeature.Italic,
    commandName: 'toggleItalic',
    markName: 'italic',
  })

  return (
    <div className="sticky top-0 z-10 -mx-4 flex gap-2 border-b p-4">
      <ToolbarButton
        label="Bold"
        shortLabel="B"
        state={bold}
        onMouseDown={preventBlur}
      />
      <ToolbarButton
        label="Italic"
        shortLabel="I"
        state={italic}
        onMouseDown={preventBlur}
      />
    </div>
  )
}

function createToolbarContext(store: EditorStore): ToolbarContext | null {
  const selectionKey = store.selection?.key

  if (selectionKey == null || !store.has(selectionKey)) {
    return null
  }

  const node = store.get(selectionKey)

  if (!isRichText(node)) {
    return null
  }

  return {
    features: node.schema.features,
    editor: store.getEditor(node),
  }
}

function getButtonState({
  context,
  feature,
  commandName,
  markName,
}: {
  context: ToolbarContext | null
  feature: RichTextFeature
  commandName: string
  markName: string
}): ToolbarButtonState {
  if (!context || !context.features.includes(feature)) {
    return { disabled: true, pressed: false }
  }

  const command = getCommand(context.editor, commandName)

  if (!command) {
    return { disabled: true, pressed: false }
  }

  const canExec = command.canExec?.() ?? false
  const mark = getMark(context.editor, markName)
  const pressed = mark?.isActive?.() ?? false

  if (!canExec) {
    return { disabled: true, pressed }
  }

  return {
    disabled: false,
    pressed,
    command: () => {
      context.editor.focus()
      command()
    },
  }
}

function ToolbarButton({
  label,
  shortLabel,
  state,
  onMouseDown,
}: {
  label: string
  shortLabel: string
  state: ToolbarButtonState
  onMouseDown: (event: MouseEvent<HTMLButtonElement>) => void
}) {
  const className = [
    'rounded-md border px-3 py-1 text-sm font-semibold transition-colors',
    state.disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100',
    state.pressed ? 'bg-gray-200 text-gray-900' : 'bg-white',
  ].join(' ')

  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      aria-pressed={state.pressed}
      disabled={state.disabled}
      onMouseDown={onMouseDown}
      onClick={() => state.command?.()}
    >
      {shortLabel}
    </button>
  )
}

function preventBlur(event: MouseEvent<HTMLButtonElement>) {
  event.preventDefault()
}

function getCommand(
  editor: Editor,
  commandName: string,
): CommandAction | undefined {
  const commands = editor.commands as
    | Record<string, CommandAction | undefined>
    | undefined
  return commands?.[commandName]
}

function getMark(
  editor: Editor,
  markName: string,
): { isActive?: () => boolean } | undefined {
  const marks = editor.marks as
    | Record<string, { isActive?: () => boolean } | undefined>
    | undefined
  return marks?.[markName]
}
