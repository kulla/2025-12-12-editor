import '@picocss/pico/css/pico.min.css'
import './App.css'
import { LoroDoc } from 'loro-crdt'
import { useEffect, useRef } from 'react'
import { initialContent } from './content/initial-content'
import { Root } from './content/types'
import { storeRoot } from './operations/store'
import type { Key } from './store/key'
import { useEditorStore } from './store/use-editor-store'

export default function App() {
  const rootKey = 'root' as Key
  const loroDoc = useRef(new LoroDoc()).current
  const { store } = useEditorStore(loroDoc)

  useEffect(() => {
    if (store.get(rootKey) != null) return

    store.update((tx) => {
      storeRoot({
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
    </main>
  )
}
