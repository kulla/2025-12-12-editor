import type { LoroDoc } from 'loro-crdt'
import type { CursorAwareness } from 'loro-prosemirror'

export interface CDRT {
  doc: LoroDoc
  awareness: CursorAwareness
}
