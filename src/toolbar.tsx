import clsx from 'clsx'
import { type CommandAction, type Editor, isMarkActive } from 'prosekit/core'
import * as F from './nodes/flat'
import type { EditorStore } from './store/editor-store'

export function Toolbar({ store }: { store: EditorStore }) {
  const editor = getFocusedEditor(store)

  console.log('toolbar render', store.cdrt.name)

  return (
    <div className="sticky top-0 z-2 flex border-b group">
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
  console.log('toolbar render', { label, canExec, isActive })

  const className = clsx(
    'rounded-md border px-3 py-1 text-sm font-semibold transition-colors',
    canExec ? 'hover:bg-gray-100' : 'opacity-40 cursor-not-allowed',
    isActive ? 'bg-gray-200 text-gray-900' : 'bg-white',
  )

  return (
    <button
      type="button"
      className={className}
      style={{ marginBottom: 0 }}
      aria-label={label}
      aria-pressed={isActive}
      disabled={!canExec}
      onMouseDown={(e) => e.preventDefault()}
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
