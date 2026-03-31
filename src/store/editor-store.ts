import { invariant } from 'es-toolkit'
import type { Editor } from 'prosekit/core'
import type * as Y from 'yjs'
import type { CDRT } from '../cdrt/types'
import { Root } from '../content'
import type { FlatNode } from '../nodes/flat'
import { createRichTextEditor } from '../rich-text/create-editor'
import type { FlatValue, RichTextSchema, Schema } from '../schema'
import { collectSchemas } from '../schema/collect-schemas'
import { type Key, type KeyGenerator, PrefixKeyGenerator } from './key'

export class EditorStore {
  private schemaNames = this.cdrt.doc.getMap('schemaNames') as Y.Map<string>
  private parentKeys = this.cdrt.doc.getMap('parentKeys') as Y.Map<Key | null>
  private values = this.cdrt.doc.getMap('values') as Y.Map<unknown>
  private metadata = this.cdrt.doc.getMap('metadata') as Y.Map<number>
  private currentTransaction: Transaction | null = null
  private schemaRegistry = createSchemaRegistry(Root)
  private editors = new Map<Key, Editor | undefined>()

  constructor(
    public readonly cdrt: CDRT,
    private readonly keyGenerator: KeyGenerator = new PrefixKeyGenerator('n'),
  ) {}

  addUpdateListener(listener: () => void) {
    this.cdrt.doc.on('update', listener)

    return () => this.cdrt.doc.off('update', listener)
  }

  get(key: Key): FlatNode {
    const schemaName = this.schemaNames.get(key)
    const parentKey = this.parentKeys.get(key)
    const value = this.values.get(key)

    invariant(schemaName != null, `Node with key ${key} does not have a schema`)
    invariant(value !== undefined, `Node with key ${key} does not have a value`)
    invariant(
      parentKey !== undefined,
      `Node with key ${key} does not have a parent key`,
    )

    const schema = this.schemaRegistry[schemaName]

    invariant(schema != null, `Schema with name ${schemaName} does not exist`)

    return { schema, key, parentKey, value }
  }

  getEditor({ key, schema }: FlatNode<RichTextSchema>): Editor {
    const editor = this.editors.get(key)

    if (editor != null) {
      return editor
    } else {
      const editor = createRichTextEditor({ key, schema, store: this })

      this.editors.set(key, editor)

      return editor
    }
  }

  has(key: Key): boolean {
    return (
      this.values.get(key) !== undefined &&
      this.schemaNames.get(key) !== undefined &&
      this.parentKeys.get(key) !== undefined
    )
  }

  getEntries(): [Key, FlatNode][] {
    return [...this.values.keys()].map((key) => [
      key as Key,
      this.get(key as Key),
    ])
  }

  get updateCount(): number {
    return this.metadata.get('updateCount') ?? 0
  }

  update<A>(updater: (tx: Transaction) => A): A {
    if (this.currentTransaction != null) {
      // If we're already in a transaction, just call the update function directly
      return updater(this.currentTransaction)
    } else {
      this.currentTransaction = this.createTransaction()

      try {
        return updater(this.currentTransaction)
      } finally {
        this.incrementUpdateCount()
        this.currentTransaction = null
      }
    }
  }

  private createTransaction(): Transaction {
    return {
      attachRoot: (rootKey: Key, value: FlatValue<Root>) => {
        this.save({ schema: Root, key: rootKey, parentKey: null, value })

        return rootKey
      },
      insert: (schema, parentKey, createValue) => {
        const key = this.keyGenerator.next()
        const value = createValue(key)

        this.save({ schema, key, parentKey, value })

        return key
      },
      setEditor: (key, editor) => {
        this.editors.set(key, editor)
      },
      store: this,
    }
  }

  private save({ schema, key, parentKey, value }: FlatNode): void {
    this.schemaNames.set(key, schema.name)
    this.parentKeys.set(key, parentKey)
    this.values.set(key, value)
  }

  private incrementUpdateCount(): void {
    this.metadata.set('updateCount', this.updateCount + 1)
  }
}

function createSchemaRegistry(
  rootSchema: Root,
): Record<string, Schema | undefined> {
  return Object.fromEntries(
    collectSchemas(rootSchema).map((schema) => [schema.name, schema]),
  )
}

export interface Transaction {
  attachRoot(rootKey: Key, value: FlatValue<Root>): Key
  insert<S extends Schema>(
    schema: S,
    parentKey: Key,
    createValue: (key: Key) => FlatValue<S>,
  ): Key
  setEditor(key: Key, editor: Editor): void
  store: EditorStore
}
