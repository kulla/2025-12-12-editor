import { invariant } from 'es-toolkit'
import type { LoroDoc, LoroMap } from 'loro-crdt'
import { collectSchemsByName } from '../content/registry'
import { Root } from '../content/types'
import type { FlatNode } from '../nodes/flat'
import type { FlatValue, Schema } from '../schema/types'
import { type Key, type KeyGenerator, PrefixKeyGenerator } from './key'

export class EditorStore {
  private nodes: FlatNodeMap
  private metadata = this.loroDoc.getMap('metadata') as LoroMap<Metadata>
  private currentTransaction: Transaction | null = null
  private schemaRegistry = collectSchemsByName(Root)

  constructor(
    private readonly loroDoc: LoroDoc,
    private readonly keyGenerator: KeyGenerator = new PrefixKeyGenerator('n'),
  ) {
    // TODO: Check that the map of the correct type
    this.nodes = this.loroDoc.getMap('nodes') as FlatNodeMap
  }

  addUpdateListener(listener: () => void) {
    return this.loroDoc.subscribe(listener)
  }

  get(key: Key): FlatNode {
    const node = this.nodes.get(key)

    invariant(node != null, `Node with key ${key} does not exist`)

    const { schemaName, ...restData } = node
    const schema = this.schemaRegistry[schemaName]

    invariant(schema != null, `Schema with name ${schemaName} does not exist`)

    return { ...restData, schema }
  }

  has(key: Key): boolean {
    return this.nodes.get(key) != null
  }

  getEntries(): Array<[Key, FlatNode]> {
    return this.nodes.keys().map((key) => [key, this.get(key)])
  }

  get updateCount(): number {
    return this.metadata.get('updateCount') ?? 0
  }

  update(updater: (tx: Transaction) => void): void {
    if (this.currentTransaction != null) {
      // If we're already in a transaction, just call the update function directly
      updater(this.currentTransaction)
    } else {
      this.currentTransaction = this.createTransaction()

      updater(this.currentTransaction)

      this.incrementUpdateCount()
      this.currentTransaction = null
    }
  }

  private createTransaction(): Transaction {
    return {
      attachRoot: (rootKey: Key, value: FlatValue<Root>) => {
        this.nodes.set(rootKey, {
          schemaName: Root.name,
          key: rootKey,
          parentKey: null,
          value: value,
        })

        return rootKey
      },
      insert: (schema, parentKey, createValue) => {
        const key = this.keyGenerator.next()
        const value = createValue(key)

        this.nodes.set(key, { schemaName: schema.name, key, parentKey, value })

        return key
      },
    }
  }

  private incrementUpdateCount(): void {
    const currentCount = this.metadata.get('updateCount') ?? 0
    this.metadata.set('updateCount', currentCount + 1)
  }
}

export interface Transaction {
  attachRoot(rootKey: Key, value: FlatValue<Root>): Key
  insert<S extends Schema>(
    schema: S,
    parentKey: Key,
    createValue: (key: Key) => FlatValue<S>,
  ): Key
}

interface Metadata {
  updateCount: number | undefined
  // TODO: Find a way so that this is not needed any more
  [key: string]: unknown
}

type FlatNodeMap = LoroMap<Record<string, StoredFlatNode>>
type StoredFlatNode = Omit<FlatNode, 'schema'> & { schemaName: string }
