import { useMemo } from 'react'
import { Awareness } from 'y-protocols/awareness'
import { Doc } from 'yjs'
import type { CDRT, EditorName } from './types'

export function useCDRT(name: EditorName, color: string): CDRT {
  return useMemo(() => {
    const doc = new Doc()
    const awareness = new Awareness(doc)

    awareness.setLocalStateField('user', { name, color })

    return { name, doc, awareness }
  }, [name, color])
}
