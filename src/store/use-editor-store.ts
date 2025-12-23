import type { LoroDoc } from 'loro-crdt'
import { useMemo, useRef, useSyncExternalStore } from 'react'
import { EditorStore } from './editor-store'

export function useEditorStore(loroDoc: LoroDoc) {
  const store = useMemo(() => new EditorStore(loroDoc), [loroDoc])
  const lastReturn = useRef({ store, updateCount: store.updateCount })

  return useSyncExternalStore(
    (listener) => store.addUpdateListener(listener),
    () => {
      if (lastReturn.current.updateCount === store.updateCount) {
        return lastReturn.current
      }

      lastReturn.current = { store, updateCount: store.updateCount }

      return lastReturn.current
    },
  )
}
