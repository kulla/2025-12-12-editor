import './App.css'

import { useEffect } from 'react'
import { syncCDRTs } from './cdrt/sync'
import { EditorName } from './cdrt/types'
import { useCDRT } from './cdrt/use-cdrt'
import { initialContent } from './content/initial-content'
import { Editor, EditorDebugPanel } from './editor'

export default function App() {
  const cdrt1 = useCDRT(EditorName.Editor1, '#00E5FF')
  const cdrt2 = useCDRT(EditorName.Editor2, '#FF2D95')

  useEffect(() => syncCDRTs(cdrt1, cdrt2), [cdrt1, cdrt2])

  return (
    <main>
      <header>
        <h1>Prototype: Collaborative editing</h1>
      </header>

      <section className="editor-grid">
        <Editor key={cdrt1.name} cdrt={cdrt1} initialContent={initialContent} />
        <Editor key={cdrt2.name} cdrt={cdrt2} />
      </section>

      <section className="debug-shell">
        <EditorDebugPanel cdrt={cdrt1} />
      </section>
    </main>
  )
}
