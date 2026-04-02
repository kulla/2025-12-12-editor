import { padStart } from 'es-toolkit/compat'
import { useEffect } from 'react'
import type { CDRT } from './cdrt/types'
import { Root } from './content'
import { DebugPanel } from './debug-panel'
import type { FlatNode } from './nodes/flat'
import { load } from './operations/load'
import { render } from './operations/render'
import { saveRoot } from './operations/save'
import type { JSONValue } from './schema'
import type { Key } from './store/key'
import { useEditorStore } from './store/use-editor-store'
import { Toolbar } from './toolbar'

const ROOT_KEY = 'root' as Key

interface EditorProps {
  cdrt: CDRT
  initialContent?: JSONValue<Root>
}

export function Editor({ cdrt, initialContent }: EditorProps) {
  const { store } = useEditorStore(cdrt)

  useEffect(() => {
    if (initialContent == null || store.has(ROOT_KEY)) return

    store.update((tx) => {
      const rootNode = { schema: Root, value: initialContent }

      saveRoot({ tx, rootKey: ROOT_KEY, node: rootNode })
    })
  }, [store, initialContent])

  return (
    <form className="editor-instance panel" aria-label={cdrt.name}>
      <h2>
        <span
          className="accent"
          style={{ backgroundColor: cdrt.color }}
          aria-hidden="true"
        />{' '}
        {cdrt.name}
      </h2>

      <section className="editor-frame inner-panel">
        <div className="editor-toolbar-shell">
          <Toolbar store={store} />
        </div>
        {store.has(ROOT_KEY)
          ? render({ store, node: store.get(ROOT_KEY) })
          : 'Loading...'}
      </section>
    </form>
  )
}

export function EditorDebugPanel({ cdrt }: { cdrt: CDRT }) {
  const { store } = useEditorStore(cdrt)

  return (
    <DebugPanel
      name={cdrt.name}
      labels={{
        json: 'External JSON value',
        entries: 'Internal flat nodes',
        selection: 'Current selection',
      }}
      showOnStartup={{ json: true, entries: false, selection: true }}
      getCurrentValue={{
        json: () => {
          if (!store.has(ROOT_KEY)) return 'Loading...'

          const jsonValue = load({ store, node: store.get(ROOT_KEY) })
          return JSON.stringify(jsonValue, null, 2)
        },
        entries: () => {
          const stringifyEntry = ([key, entry]: [string, FlatNode]) =>
            `${padStart(key, 4)}: ${JSON.stringify(entry.value)}`

          const lines = store.getEntries().map(stringifyEntry)

          lines.sort()

          return lines.join('\n')
        },
        selection: () => {
          return JSON.stringify(store.selection, null, 2)
        },
      }}
    />
  )
}
