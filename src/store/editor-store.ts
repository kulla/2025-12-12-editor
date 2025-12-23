import { invariant } from 'es-toolkit'
import type { LoroDoc, LoroMap } from 'loro-crdt'
import type { FlatNode } from '../nodes/flat'
import { schemaRegistry } from '../schema/content'
import type { Key } from './key'

export class EditorStore {
  nodes: FlatNodeMap

  constructor(private readonly loroDoc: LoroDoc) {
    // TODO: Check that the map of the correct type
    this.nodes = this.loroDoc.getMap('nodes') as FlatNodeMap
  }

  get(key: Key): FlatNode {
    const node = this.nodes.get(key)

    invariant(node != null, `Node with key ${key} does not exist`)

    const { schemaName, ...restData } = node
    const schema = schemaRegistry[schemaName]

    invariant(schema != null, `Schema with name ${schemaName} does not exist`)

    return { ...restData, schema }
  }
}

type FlatNodeMap = LoroMap<Record<string, StoredFlatNode>>
type StoredFlatNode = Omit<FlatNode, 'schema'> & { schemaName: string }
