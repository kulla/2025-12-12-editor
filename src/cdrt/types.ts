import type { LoroDoc } from 'loro-crdt'
import type { CursorAwareness } from 'loro-prosemirror'

export interface CDRT {
  name: EditorName
  doc: LoroDoc
  awareness: CursorAwareness
  color: string
}

export enum EditorName {
  Editor1 = 'Editor 1',
  Editor2 = 'Editor 2',
}
