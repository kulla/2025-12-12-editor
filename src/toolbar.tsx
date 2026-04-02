import { isMarkActive, type CommandAction, type Editor } from 'prosekit/core'
import * as F from './nodes/flat'
import type { EditorStore } from './store/editor-store'
import clsx from 'clsx'

export function Toolbar({ store }: { store: EditorStore }) {
  const editor = getFocusedEditor(store)

  return (
    <div className="sticky top-0 z-10 -mx-4 flex gap-2 border-b p-4">
      <ToolbarButton
        label="Toggle Bold"
        shortLabel="B"
        isActive={editor !== null && isMarkActive(editor.state, 'bold')}
        canExec={canExecCommand(editor, 'toggleBold')}
        onClick={() => execCommand(editor, 'toggleBold')}
      />
      <ToolbarButton
        label="Italic"
        shortLabel="I"
        isActive={editor !== null && isMarkActive(editor.state, 'italic')}
        canExec={canExecCommand(editor, 'toggleItalic')}
        onClick={() => execCommand(editor, 'toggleItalic')}
      />
    </div>
  )
}

function getFocusedEditor(store: EditorStore): Editor | null {
  const selectionKey = store.selection?.key

  if (selectionKey == null || !store.has(selectionKey)) return null

  const node = store.get(selectionKey)

  return F.isRichText(node) ? store.getEditor(node) : null
}

function ToolbarButton({
  label,
  shortLabel,
  canExec,
  isActive,
  onClick,
}: {
  label: string
  shortLabel: string
  canExec: boolean
  isActive: boolean
  onClick: () => void
}) {
  const className = clsx(
    'rounded-md border px-3 py-1 text-sm font-semibold transition-colors',
    canExec ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100',
    isActive ? 'bg-gray-200 text-gray-900' : 'bg-white',
  )

  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      aria-pressed={isActive}
      disabled={!canExec}
      onClick={onClick}
    >
      {shortLabel}
    </button>
  )
}

function execCommand(editor: Editor | null, commandName: string): void {
  if (editor == null) return

  const command = getCommand(editor, commandName)

  if (command != null) {
    command()
  }
}

function canExecCommand(editor: Editor | null, commandName: string): boolean {
  if (editor == null) return false

  const command = getCommand(editor, commandName)

  return command != null ? command.canExec() : false
}

function getCommand(editor: Editor, commandName: string): CommandAction | null {
  const command = editor.commands[commandName]

  return typeof command === 'function' ? command : null
}
