import * as S from '../schema'
import type { Guard } from '../utils/guard'

export type NestedNode<S extends S.Schema = S.Schema> = S extends unknown
  ? _NestedNode<S>
  : never

interface _NestedNode<S extends S.Schema> {
  schema: S
  value: S.JSONValue<S>
}

export function getSingletonChild({
  schema,
  value,
}: NestedNode<S.WrapperSchema | S.UnionSchema>) {
  if (S.isWrapper(schema)) {
    return { schema: schema.wrappedSchema, value: schema.unwrap(value) }
  } else {
    return { schema: schema.getOption(value), value }
  }
}

export function getItems({ schema, value }: NestedNode<S.ArraySchema>) {
  return value.map((itemValue) => {
    return { schema: schema.itemSchema, value: itemValue }
  })
}

export function getProperty(
  { schema, value }: NestedNode<S.ObjectSchema>,
  key: string,
) {
  return { schema: schema.properties[key], value: value[key] }
}

export const isTruthValue = createGuard(S.isTruthValue)
export const isRichText = createGuard(S.isRichText)
export const isLiteral = createGuard(S.isLiteral)
export const isWrapper = createGuard(S.isWrapper)
export const isUnion = createGuard(S.isUnion)
export const isArray = createGuard(S.isArray)
export const isObject = createGuard(S.isObject)
export const isPrimitive = createGuard(S.isPrimitive)
export const isLeaf = createGuard(S.isLeaf)
export const isSingleton = createGuard(S.isSingletonSchema)

function createGuard<S extends S.Schema>(schemaGuard: Guard<S>) {
  return (node: NestedNode): node is NestedNode<S> => schemaGuard(node.schema)
}
