import type { Awareness } from 'y-protocols/awareness'
import type { Doc } from 'yjs'

export interface CDRT {
  name: EditorName
  doc: Doc
  awareness: Awareness
}

export enum EditorName {
  Editor1 = 'Editor 1',
  Editor2 = 'Editor 2',
}
