import type { LoroDoc } from 'loro-crdt'
import type { CursorAwareness } from 'loro-prosemirror'

export interface CDRT {
  name: string
  doc: LoroDoc
  awareness: CursorAwareness
}
