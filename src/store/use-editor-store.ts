import { useMemo, useRef, useSyncExternalStore } from 'react'
import type { CDRT } from '../cdrt/types'
import { EditorStore } from './editor-store'

export function useEditorStore(cdrt: CDRT) {
  const store = useMemo(() => new EditorStore(cdrt), [cdrt])
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
