import { padStart } from 'es-toolkit/compat'
import { useEffect } from 'react'
import type { CDRT } from './cdrt/types'
import { Root } from './content'
import type { FlatNode } from './nodes/flat'
import { load } from './operations/load'
import { render } from './operations/render'
import { saveRoot } from './operations/save'
import type { JSONValue } from './schema'
import type { EditorStore } from './store/editor-store'
import type { Key } from './store/key'
import { useEditorStore } from './store/use-editor-store'

const ROOT_KEY = 'root' as Key

interface EditorProps {
  cdrt: CDRT
  initialContent?: JSONValue<Root>
  afterUpdate?: (store: EditorStore) => void
}

export function Editor({ cdrt, initialContent, afterUpdate }: EditorProps) {
  const { store } = useEditorStore(cdrt)

  useEffect(() => {
    if (afterUpdate == null) return

    return store.addUpdateListener(() => afterUpdate(store))
  }, [store, afterUpdate])

  useEffect(() => {
    if (initialContent == null || store.has(ROOT_KEY)) return

    store.update((tx) => {
      const rootNode = { schema: Root, value: initialContent }

      saveRoot({ tx, rootKey: ROOT_KEY, node: rootNode })
    })
  }, [store, initialContent])

  return (
    <div className="p-4 rounded-lg border sm:w-[48%]">
      {store.has(ROOT_KEY)
        ? render({ store, node: store.get(ROOT_KEY) })
        : 'Loading...'}
    </div>
  )
}

export function getDebugValues(store: EditorStore) {
  return {
    json: () => {
      if (!store.has(ROOT_KEY)) return 'Loading...'

      const jsonValue = load({ store, node: store.get(ROOT_KEY) })
      return JSON.stringify(jsonValue, null, 2)
    },
    entries: () => {
      const stringifyEntry = ([key, entry]: [string, FlatNode]) =>
        `${padStart(key, 4)}: ${JSON.stringify(entry.value)}`

      const lines = store.getEntries().map(stringifyEntry)

      lines.sort()

      return lines.join('\n')
    },
  }
}
