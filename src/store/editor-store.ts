import { invariant } from 'es-toolkit'
import { type LoroDoc, LoroList, LoroMap } from 'loro-crdt'
import { Root } from '../content'
import type { FlatNode } from '../nodes/flat'
import type { FlatValue, Schema } from '../schema'
import { collectSchemas } from '../schema/collect-schemas'
import { type Key, type KeyGenerator, PrefixKeyGenerator } from './key'

export class EditorStore {
  private nodes = this.loroDoc.getMap('nodes') as FlatNodeMap
  private metadata = this.loroDoc.getMap('metadata') as LoroMap<Metadata>
  private currentTransaction: Transaction | null = null
  private schemaRegistry = createSchemaRegistry(Root)

  constructor(
    public readonly loroDoc: LoroDoc,
    private readonly keyGenerator: KeyGenerator = new PrefixKeyGenerator('n'),
  ) {}

  addUpdateListener(listener: () => void) {
    return this.loroDoc.subscribe(listener)
  }

  get(key: Key): FlatNode {
    const node = this.nodes.get(key)

    invariant(node != null, `Node with key ${key} does not exist`)

    const schemaName = node.get('schemaName')
    const schema = this.schemaRegistry[schemaName]

    invariant(schema != null, `Schema with name ${schemaName} does not exist`)

    return {
      schema,
      key: node.get('key'),
      parentKey: node.get('parentKey'),
      value: node.get('value'),
    }
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
    }
  }

  private save({ schema, key, parentKey, value }: FlatNode): void {
    const map = new LoroMap<StoredFlatNode>()

    map.set('schemaName', schema.name)
    map.set('key', key)
    map.set('parentKey', parentKey)

    if (value instanceof LoroMap || value instanceof LoroList) {
      map.setContainer('value', value)
    } else {
      map.set('value', value)
    }

    this.nodes.setContainer(key, map)
  }

  private incrementUpdateCount(): void {
    const currentCount = this.metadata.get('updateCount') ?? 0
    this.metadata.set('updateCount', currentCount + 1)
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
}

interface Metadata {
  updateCount: number | undefined
  // TODO: Find a way so that this is not needed any more
  [key: string]: unknown
}

type FlatNodeMap = LoroMap<Record<string, LoroMap<StoredFlatNode>>>
type StoredFlatNode = Omit<FlatNode, 'schema'> & { schemaName: string }
