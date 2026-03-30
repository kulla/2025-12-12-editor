import { LoroDoc } from 'loro-crdt'
import { CursorAwareness } from 'loro-prosemirror'
import { useMemo } from 'react'
import type { CDRT, EditorName } from './types'

export function useCDRT(name: EditorName, color: string): CDRT {
  return useMemo(() => {
    const doc = new LoroDoc()
    const awareness = new CursorAwareness(doc.peerIdStr)

    return { name, doc, awareness, color }
  }, [name, color])
}
