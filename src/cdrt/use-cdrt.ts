import { LoroDoc } from 'loro-crdt'
import { CursorAwareness } from 'loro-prosemirror'
import { useRef } from 'react'
import type { CDRT, EditorName } from './types'

export function useCDRT(name: EditorName, color: string): CDRT {
  const doc = useRef(new LoroDoc()).current
  const awareness = useRef(new CursorAwareness(doc.peerIdStr)).current

  return { name, doc, awareness, color }
}
