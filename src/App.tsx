import './App.css'

import { padStart } from 'es-toolkit/compat'
import { useEffect, useState } from 'react'
import { syncCDRTs } from './cdrt/sync'
import { useLoroDoc as useCDRTInstance } from './cdrt/use-cdrt'
import { Root } from './content'
import { initialContent } from './content/initial-content'
import { DebugPanel } from './debug-panel'
import type { FlatNode } from './nodes/flat'
import { load } from './operations/load'
import { render } from './operations/render'
import { saveRoot } from './operations/save'
import type { Key } from './store/key'
import { useEditorStore } from './store/use-editor-store'

export default function App() {
  const rootKey = 'root' as Key
  const cdrt1 = useCDRTInstance()
  const cdrt2 = useCDRTInstance()
  const { store: store1 } = useEditorStore(cdrt1)
  const { store: store2 } = useEditorStore(cdrt2)
  const rootNode1 = store1.has(rootKey) ? store1.get(rootKey) : null
  const rootNode2 = store2.has(rootKey) ? store2.get(rootKey) : null
  // hotfix
  const [_isInitialized, setIsInitialized] = useState(false)

  useEffect(() => syncCDRTs(cdrt1, cdrt2), [cdrt1, cdrt2])

  useEffect(() => {
    if (store1.has(rootKey)) return

    store1.update((tx) => {
      const rootNode = { schema: Root, value: initialContent }

      saveRoot({ tx, rootKey, node: rootNode })

      setIsInitialized(true)
    })
  }, [rootKey, store1])

  return (
    <main className="p-10">
      <h1>Synchronisierte Editoren</h1>
      <div className="sm:flex gap-[4%] mb-10">
        <div className="p-4 rounded-lg border sm:w-[48%]">
          {rootNode1
            ? render({ store: store1, node: rootNode1 })
            : 'Loading...'}
        </div>
        <div className="p-4 rounded-lg border sm:w-[48%]">
          {rootNode2
            ? render({ store: store2, node: rootNode2 })
            : 'Loading...'}
        </div>
      </div>
      <DebugPanel
        labels={{ json: 'External JSON value', entries: 'Internal flat nodes' }}
        showOnStartup={{ json: true, entries: true }}
        getCurrentValue={{
          json: () => {
            if (rootNode1 == null) return 'Loading...'

            const jsonValue = load({ store: store1, node: rootNode1 })
            return JSON.stringify(jsonValue, null, 2)
          },
          entries: () => {
            const stringifyEntry = ([key, entry]: [string, FlatNode]) =>
              `${padStart(key, 4)}: ${JSON.stringify(entry.value)}`

            const lines = store1.getEntries().map(stringifyEntry)

            lines.sort()

            return lines.join('\n')
          },
        }}
      />
    </main>
  )
}
