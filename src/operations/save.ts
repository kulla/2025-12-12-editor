import { LoroList, LoroMap } from 'loro-crdt'
import type { Root } from '../content'
import * as N from '../nodes/nested'
import { DEFAULT_CONTENT_KEY } from '../rich-text'
import type { Transaction } from '../store/editor-store'
import type { Key } from '../store/key'

export function saveRoot(args: {
  tx: Transaction
  node: N.NestedNode<Root>
  rootKey: Key
}): Key {
  const { tx, node, rootKey } = args

  return tx.attachRoot(rootKey, save({ tx, parentKey: rootKey, node }))
}

export function save(args: {
  tx: Transaction
  parentKey: Key
  node: N.NestedNode
}): Key {
  const { tx, parentKey, node } = args

  if (N.isPrimitive(node)) {
    return tx.insert(node.schema, parentKey, () => node.value)
  } else if (N.isRichText(node)) {
    const map = new LoroMap()

    map.set(DEFAULT_CONTENT_KEY, node.value)

    return tx.insert(node.schema, parentKey, () => map)
  } else if (N.isWrapper(node)) {
    return tx.insert(node.schema, parentKey, (key) =>
      save({ tx, parentKey: key, node: N.unwrap(node) }),
    )
  } else if (N.isUnion(node)) {
    return tx.insert(node.schema, parentKey, (key) =>
      save({ tx, parentKey: key, node: N.getOption(node) }),
    )
  } else if (N.isArray(node)) {
    return tx.insert(node.schema, parentKey, (key) => {
      const list = new LoroList<Key>()

      N.getItems(node).forEach((itemNode) => {
        list.push(save({ tx, parentKey: key, node: itemNode }))
      })

      return list
    })
  } else if (N.isObject(node)) {
    return tx.insert(node.schema, parentKey, (key) => {
      const map = new LoroMap<Record<string, Key>>()

      for (const propertyName of Object.keys(node.schema.properties)) {
        const propertyNode = N.getProperty(node, propertyName)

        const propertyKey = save({ tx, parentKey: key, node: propertyNode })

        map.set(propertyName, propertyKey)
      }

      return map
    })
  } else {
    throw new Error(`Unsupported schema kind: ${node.schema.kind}`)
  }
}
