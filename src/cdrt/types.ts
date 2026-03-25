import type { LoroDoc } from 'loro-crdt'
import type { CursorAwareness } from 'loro-prosemirror'

export interface CDRTInstance {
  doc: LoroDoc
  awareness: CursorAwareness
}
