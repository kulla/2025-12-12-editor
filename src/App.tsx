import '@picocss/pico/css/pico.min.css'
import './App.css'
import { LoroDoc } from 'loro-crdt'
import { useRef } from 'react'
import type { Key } from './store/key'
import { useEditorStore } from './store/use-editor-store'

export default function App() {
  const rootKey = "root" as Key
  const loroDoc = useRef(new LoroDoc()).current
  const { store } = useEditorStore(loroDoc)

  useEffect(() => {
    if (store.get(rootKey) != null) return

    store.update(tx => {

    })

  return (
    <main className="p-10">
      <h1>Rsbuild with React</h1>
      <p>Start building amazing things with Rsbuild.</p>
    </main>
  )
}
