import './App.css'

import { useCallback, useEffect, useState } from 'react'
import { syncCDRTs } from './cdrt/sync'
import { useCDRT } from './cdrt/use-cdrt'
import { initialContent } from './content/initial-content'
import { DebugPanel } from './debug-panel'
import { Editor, getDebugValues } from './editor'
import type { EditorStore } from './store/editor-store'

export default function App() {
  const cdrt1 = useCDRT()
  const cdrt2 = useCDRT()
  const [debugValues, setDebugValues] = useState({
    json: () => 'Loading...' as string,
    entries: () => 'Loading...' as string,
  })
  const afterUpdate = useCallback((store: EditorStore) => {
    setDebugValues(getDebugValues(store))
  }, [])

  useEffect(() => syncCDRTs(cdrt1, cdrt2), [cdrt1, cdrt2])

  return (
    <main className="p-10">
      <h1>Synchronisierte Editoren</h1>
      <div className="sm:flex gap-[4%] mb-10">
        <Editor
          cdrt={cdrt1}
          initialContent={initialContent}
          afterUpdate={afterUpdate}
        />
        <Editor cdrt={cdrt2} />
      </div>
      <DebugPanel
        labels={{ json: 'External JSON value', entries: 'Internal flat nodes' }}
        showOnStartup={{ json: true, entries: true }}
        getCurrentValue={debugValues}
      />
    </main>
  )
}
