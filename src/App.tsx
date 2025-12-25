import '@picocss/pico/css/pico.min.css'
import './App.css'
import { padStart } from 'es-toolkit/compat'
import { LoroDoc } from 'loro-crdt'
import { useEffect, useRef } from 'react'
import { initialContent } from './content/initial-content'
import { Root } from './content/types'
import { DebugPanel } from './debug-panel'
import type { FlatNode } from './nodes/flat'
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
      saveRoot({
        tx,
        rootKey,
        node: { schema: Root, value: initialContent },
      })
    })
  }, [rootKey, store])

  return (
    <main className="p-10">
      <h1>Rsbuild with React</h1>
      <p>Start building amazing things with Rsbuild.</p>
      <DebugPanel
        labels={{ entries: 'Internal flat nodes' }}
        showOnStartup={{ entries: true }}
        getCurrentValue={{
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
