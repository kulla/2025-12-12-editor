import { LoroMap } from 'loro-crdt'
import { isKey, type Key } from './store/key'
import { type Guard, isBoolean, isInstanceOf } from './utils/guard'

declare const TypeInformation: unique symbol

interface SchemaDef {
  kind: string
  FlatValue: unknown
  JSONValue: unknown
}

export interface Schema<D extends SchemaDef = SchemaDef> {
  kind: D['kind']
  name: string
  isFlatValue: Guard<D['FlatValue']>
  [TypeInformation]?: {
    FlatValue: D['FlatValue']
    JSONValue: D['JSONValue']
  }
}

export type FlatValue<S extends Schema> = NonNullable<
  S[typeof TypeInformation]
>['FlatValue']

export type JSONValue<S extends Schema> = NonNullable<
  S[typeof TypeInformation]
>['JSONValue']

type Arguments<S extends Schema> = Omit<
  S,
  'kind' | typeof TypeInformation | 'isFlatValue'
>

function createSchemaGuard<S extends Schema>(kind: string): Guard<S> {
  return (value: unknown): value is S => {
    return (
      typeof value === 'object' &&
      value !== null &&
      'kind' in value &&
      value.kind === kind
    )
  }
}

interface BooleanSchema
  extends Schema<{
    kind: 'boolean'
    FlatValue: boolean
    JSONValue: boolean
  }> {}

export function createBooleanSchema(
  args: Arguments<BooleanSchema>,
): BooleanSchema {
  return { kind: 'boolean', isFlatValue: isBoolean, ...args }
}

export const isBooleanSchema = createSchemaGuard<BooleanSchema>('boolean')

interface RichTextSchema
  extends Schema<{
    kind: 'richText'
    FlatValue: LoroMap
    JSONValue: string
  }> {}

export function createRichTextSchema(
  args: Arguments<RichTextSchema>,
): RichTextSchema {
  return { kind: 'richText', isFlatValue: isInstanceOf(LoroMap), ...args }
}

export const isRichTextSchema = createSchemaGuard<RichTextSchema>('string')

interface UnionSchema<S extends Schema[] = Schema[]>
  extends Schema<{
    kind: 'union'
    FlatValue: Key
    JSONValue: JSONValue<S[number]>
  }> {
  options: S
  getOption(value: JSONValue<S[number]>): S[number]
}

export function createUnionSchema<S extends Schema[]>(
  args: Arguments<UnionSchema<S>>,
): UnionSchema<S> {
  return { kind: 'union', isFlatValue: isKey, ...args }
}

export const isUnionSchema = createSchemaGuard<UnionSchema>('union')
