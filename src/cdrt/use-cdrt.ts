import { LoroDoc } from 'loro-crdt'
import { CursorAwareness } from 'loro-prosemirror'
import { useRef } from 'react'
import type { CDRT } from './types'

export function useCDRT(): CDRT {
  const doc = useRef(new LoroDoc()).current
  const awareness = useRef(new CursorAwareness(doc.peerIdStr)).current

  return { doc, awareness }
}
