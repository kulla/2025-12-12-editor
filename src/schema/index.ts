import { invariant } from 'es-toolkit'
import type { LoroList, LoroMap } from 'loro-crdt'
import type { NodeJSON } from 'prosekit/core'
import type { ReactNode } from 'react'
import type { FlatNode } from '../nodes/flat'
import type { RichTextFeature } from '../rich-text/types'
import type { EditorStore } from '../store/editor-store'
import { isKey, type Key } from '../store/key'
import * as G from '../utils/guard'
import { isLoroList, isLoroMap } from '../utils/loro'
import type { JSONValue, OmitTypeInfo, Schema } from './types'

export type { FlatValue, JSONValue, Schema } from './types'

export interface TruthValueSchema
  extends Schema<{
    kind: 'boolean'
    FlatValue: boolean
    JSONValue: boolean
  }> {
  customBehavior?: CustomBehavior<this>
}

export interface RichTextSchema
  extends Schema<{
    kind: 'richText'
    FlatValue: LoroMap
    JSONValue: NodeJSON
  }> {
  readonly features: Array<RichTextFeature>
  customBehavior?: CustomBehavior<this>
}

export interface LiteralSchema<
  T extends string | number | boolean = string | number | boolean,
> extends Schema<{
    kind: 'literal'
    FlatValue: T
    JSONValue: T
  }> {
  readonly value: T
  customBehavior?: CustomBehavior<this>
}

export interface WrapperSchema<S extends Schema = Schema, J = JSONValue<S>>
  extends Schema<{
    kind: 'wrapper'
    FlatValue: Key
    JSONValue: J
  }> {
  wrappedSchema: S
  wrap(inner: JSONValue<S>): J
  unwrap(outer: J): JSONValue<S>
  customBehavior?: CustomBehavior<this>
}

export interface UnionSchema<S extends readonly Schema[] = readonly Schema[]>
  extends Schema<{
    kind: 'union'
    FlatValue: Key
    JSONValue: JSONValue<S[number]>
  }> {
  options: S
  getOption(value: JSONValue<S[number]>): S[number]
  customBehavior?: CustomBehavior<this>
}

export interface ArraySchema<S extends Schema = Schema>
  extends Schema<{
    kind: 'array'
    FlatValue: LoroList<Key>
    JSONValue: JSONValue<S>[]
  }> {
  itemSchema: S
  htmlTag?: React.HTMLElementType
  className?: string
  customBehavior?: CustomBehavior<this>
}

export interface ObjectSchema<
  P extends Record<string, Schema> = Record<string, Schema>,
> extends Schema<{
    kind: 'object'
    FlatValue: LoroMap<{ [K in keyof P]: Key }>
    JSONValue: { [K in keyof P]: JSONValue<P[K]> }
  }> {
  properties: Readonly<P>
  keyOrder: readonly (keyof P)[]
  htmlTag?: React.HTMLElementType
  className?: string
  customBehavior?: CustomBehavior<this>
}

interface CustomBehavior<S extends Schema = Schema> {
  render?: (args: {
    node: FlatNode<S>
    store: EditorStore
    renderChild: (node: FlatNode) => ReactNode
  }) => ReactNode
}

export function createTruthValue(
  args: FactoryArguments<TruthValueSchema>,
): TruthValueSchema {
  return { kind: 'boolean', isFlatValue: G.isBoolean, ...args }
}

export function createRichText(
  args: FactoryArguments<RichTextSchema>,
): RichTextSchema {
  return { kind: 'richText', isFlatValue: isLoroMap, ...args }
}

export function createLiteral<T extends string | number | boolean>(
  args: FactoryArguments<LiteralSchema<T>>,
): LiteralSchema<T> {
  return { kind: 'literal', isFlatValue: G.isLiteral(args.value), ...args }
}

export function createWrapper<S extends Schema, J = JSONValue<S>>(
  args: FactoryArguments<WrapperSchema<S, J>>,
): WrapperSchema<S, J> {
  return { kind: 'wrapper', isFlatValue: isKey, ...args }
}

export function createUnion<S extends readonly Schema[]>(
  args: FactoryArguments<UnionSchema<S>>,
): UnionSchema<S> {
  return { kind: 'union', isFlatValue: isKey, ...args }
}

export function createArray<S extends Schema>(
  args: FactoryArguments<ArraySchema<S>>,
): ArraySchema<S> {
  return {
    kind: 'array',
    isFlatValue(value): value is LoroList<Key> {
      return isLoroList(value) && value.toArray().every(isKey)
    },
    ...args,
  }
}

export function createObject<Props extends Record<string, Schema>>(
  args: FactoryArguments<ObjectSchema<Props>>,
): ObjectSchema<Props> {
  const propertyNames = Object.keys(args.properties)

  invariant(
    propertyNames.length !== 0,
    'Object schema must have at least one property',
  )

  return {
    kind: 'object',
    isFlatValue(value): value is LoroMap<{ [K in keyof Props]: Key }> {
      return isLoroMap(value) && value.values().every(isKey)
    },
    ...args,
  }
}

type FactoryArguments<S extends Schema> = Omit<
  OmitTypeInfo<S>,
  'kind' | 'isFlatValue'
>

export const hasCustomBehavior = (
  schema: Schema,
): schema is Schema & { customBehavior: CustomBehavior } => {
  return 'customBehavior' in schema && schema.customBehavior !== undefined
}

export const isTruthValue = createGuard<TruthValueSchema>('boolean')
export const isRichText = createGuard<RichTextSchema>('richText')
export const isLiteral = createGuard<LiteralSchema>('literal')
export const isWrapper = createGuard<WrapperSchema>('wrapper')
export const isUnion = createGuard<UnionSchema>('union')
export const isArray = createGuard<ArraySchema>('array')
export const isObject = createGuard<ObjectSchema>('object')
export const isPrimitive = G.isUnion(isTruthValue, isLiteral)
export const isLeaf = G.isUnion(isTruthValue, isLiteral, isRichText)
export const isSingletonSchema = G.isUnion(isWrapper, isUnion)

function createGuard<S extends Schema>(kind: S['kind']): G.Guard<S> {
  return (value: unknown): value is S => {
    return (
      typeof value === 'object' &&
      value !== null &&
      'kind' in value &&
      value.kind === kind
    )
  }
}
