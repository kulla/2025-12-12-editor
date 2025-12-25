import * as S from '../schema'
import type { Guard } from '../utils/guard'

export interface NestedNode<S extends S.Schema = S.Schema> {
  schema: S
  value: S.JSONValue<S>
}

export function unwrap({ schema, value }: NestedNode<S.WrapperSchema>) {
  return { schema: schema.wrappedSchema, value: schema.unwrap(value) }
}

export function getOption({ schema, value }: NestedNode<S.UnionSchema>) {
  return { schema: schema.getOption(value), value }
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

export const isTruthValue = createNestedNodeGuard(S.isTruthValueSchema)
export const isRichText = createNestedNodeGuard(S.isRichTextSchema)
export const isLiteral = createNestedNodeGuard(S.isLiteralSchema)
export const isWrapper = createNestedNodeGuard(S.isWrapperSchema)
export const isUnion = createNestedNodeGuard(S.isUnionSchema)
export const isArray = createNestedNodeGuard(S.isArraySchema)
export const isObject = createNestedNodeGuard(S.isObjectSchema)
export const isPrimitive = createNestedNodeGuard(S.isPrimitiveSchema)
export const isSingleton = createNestedNodeGuard(S.isSingletonSchema)

function createNestedNodeGuard<S extends S.Schema>(schemaGuard: Guard<S>) {
  return (node: NestedNode): node is NestedNode<S> => schemaGuard(node.schema)
}
