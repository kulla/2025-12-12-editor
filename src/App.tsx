import './App.css'

import { padStart } from 'es-toolkit/compat'
import type { AwarenessListener } from 'loro-crdt'
import { useEffect, useState } from 'react'
import { useLoroDoc as useCDRTInstance } from './cdrt/use-cdrt-instance'
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
  const { doc: loroA, awareness: awarenessA } = useCDRTInstance()
  const { doc: loroB, awareness: awarenessB } = useCDRTInstance()
  const { store: storeA } = useEditorStore(loroA, awarenessA)
  const { store: storeB } = useEditorStore(loroB, awarenessB)
  const rootNodeA = storeA.has(rootKey) ? storeA.get(rootKey) : null
  const rootNodeB = storeB.has(rootKey) ? storeB.get(rootKey) : null
  // hotfix
  const [_isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Code taken from https://prosekit.dev/extensions/loro/
    loroA.import(loroB.export({ mode: 'update' }))
    loroB.import(loroA.export({ mode: 'update' }))

    const unsubscribeA = loroA.subscribeLocalUpdates((bytes) =>
      loroB.import(bytes),
    )
    const unsubscribeB = loroB.subscribeLocalUpdates((bytes) =>
      loroA.import(bytes),
    )

    const awarenessAListener: AwarenessListener = (_, origin) => {
      if (origin === 'local') {
        awarenessB.apply(awarenessA.encode([loroA.peerIdStr]))
      }
    }
    const awarenessBListener: AwarenessListener = (_, origin) => {
      if (origin === 'local') {
        awarenessA.apply(awarenessB.encode([loroB.peerIdStr]))
      }
    }
    awarenessA.addListener(awarenessAListener)
    awarenessB.addListener(awarenessBListener)

    return () => {
      unsubscribeA()
      unsubscribeB()
      awarenessA.removeListener(awarenessAListener)
      awarenessB.removeListener(awarenessBListener)
    }
  }, [loroA, loroB, awarenessA, awarenessB])

  useEffect(() => {
    if (storeA.has(rootKey)) return

    storeA.update((tx) => {
      const rootNode = { schema: Root, value: initialContent }

      saveRoot({ tx, rootKey, node: rootNode })

      setIsInitialized(true)
    })
  }, [rootKey, storeA])

  return (
    <main className="p-10">
      <h1>Synchronisierte Editoren</h1>
      <div className="flex gap-10 mb-10">
        <div className="p-4 rounded-lg border">
          {rootNodeA
            ? render({ store: storeA, node: rootNodeA })
            : 'Loading...'}
        </div>
        <div className="p-4 rounded-lg border">
          {rootNodeB
            ? render({ store: storeB, node: rootNodeB })
            : 'Loading...'}
        </div>
      </div>
      <DebugPanel
        labels={{ json: 'External JSON value', entries: 'Internal flat nodes' }}
        showOnStartup={{ json: true, entries: true }}
        getCurrentValue={{
          json: () => {
            if (rootNodeA == null) return 'Loading...'

            const jsonValue = load({ store: storeA, node: rootNodeA })
            return JSON.stringify(jsonValue, null, 2)
          },
          entries: () => {
            const stringifyEntry = ([key, entry]: [string, FlatNode]) =>
              `${padStart(key, 4)}: ${JSON.stringify(entry.value)}`

            const lines = storeA.getEntries().map(stringifyEntry)

            lines.sort()

            return lines.join('\n')
          },
        }}
      />
    </main>
  )
}
