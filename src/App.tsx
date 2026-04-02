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
    <main className="app-shell">
      <header className="hero">
        <p className="hero-label">Loro + ProseMirror</p>
        <div className="hero-title-row">
          <h1>Synchronisierte Editoren</h1>
        </div>
        <p className="hero-subtitle">
          Zwei voneinander getrennte ProseMirror-Instanzen werden über einen
          gemeinsamen Loro-Doc synchronisiert. Bearbeite beide Seiten frei, der
          CRDT sorgt für Konsistenz und verhindert Konflikte.
        </p>
        <div className="hero-meta">
          <span>Realtime Merge Safety</span>
          <span>Kontextuelles Bold/Italic</span>
        </div>
      </header>

      <section className="editor-section">
        <div className="editor-grid">
          <Editor
            key={cdrt1.name}
            cdrt={cdrt1}
            initialContent={initialContent}
          />
          <Editor key={cdrt2.name} cdrt={cdrt2} />
        </div>

        <div className="debug-shell">
          <EditorDebugPanel cdrt={cdrt1} />
        </div>
      </section>
    </main>
  )
}
