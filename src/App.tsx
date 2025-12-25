import '@picocss/pico/css/pico.min.css'
import './App.css'
import { padStart } from 'es-toolkit/compat'
import { LoroDoc } from 'loro-crdt'
import { useEffect, useRef } from 'react'
import { Root } from './content'
import { initialContent } from './content/initial-content'
import { DebugPanel } from './debug-panel'
import type { FlatNode } from './nodes/flat'
import { load } from './operations/load'
import { saveRoot } from './operations/save'
import type { Key } from './store/key'
import { useEditorStore } from './store/use-editor-store'

export default function App() {
  const rootKey = 'root' as Key
  const loroDoc = useRef(new LoroDoc()).current
  const { store } = useEditorStore(loroDoc)

  useEffect(() => {
    if (store.has(rootKey)) return

    store.update((tx) => {
      const rootNode = { schema: Root, value: initialContent }

      saveRoot({ tx, rootKey, node: rootNode })
    })
  }, [rootKey, store])

  return (
    <main className="p-10">
      <h1>Rsbuild with React</h1>
      <p>Start building amazing things with Rsbuild.</p>
      <DebugPanel
        labels={{ json: 'External JSON value', entries: 'Internal flat nodes' }}
        showOnStartup={{ json: true, entries: true }}
        getCurrentValue={{
          json: () => {
            if (!store.has(rootKey)) return 'Loading...'

            const jsonValue = load({ store, node: store.get(rootKey) })
            return JSON.stringify(jsonValue, null, 2)
          },
          entries: () => {
            const stringifyEntry = ([key, entry]: [string, FlatNode]) =>
              `${padStart(key, 4)}: ${JSON.stringify(entry.value)}`

            const lines = store.getEntries().map(stringifyEntry)

            lines.sort()

            return lines.join('\n')
          },
        }}
      />
    </main>
  )
}
