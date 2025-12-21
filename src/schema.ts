import type { Key } from './store/key'

declare const TypeInformation: unique symbol

export interface SchemaType {
  kind: string
  name: string
  [TypeInformation]: {
    FlatValue: unknown
    JSONValue: unknown
  }
}

export type FlatValue<S extends SchemaType> =
  S[typeof TypeInformation]['FlatValue']

export type JSONValue<S extends SchemaType> =
  S[typeof TypeInformation]['JSONValue']

interface SchemaDefinition {
  kind: string
  FlatValue: unknown
  JSONValue: unknown
  Parameters: {}
}

interface Factory<I, O> {
  create(input: I): O
}

interface Guard<V> {
  is(value: unknown): value is V
}

type SchemaInput<I extends SchemaDefinition> = I['Parameters'] & {
  name: string
}

type SchemaOutput<I extends SchemaDefinition> = SchemaType &
  I['Parameters'] & {
    kind: I['kind']
    [TypeInformation]: {
      FlatValue: I['FlatValue']
      JSONValue: I['JSONValue']
    }
  }

const schemaFactory = <I extends SchemaDefinition>(): Factory<
  I['kind'],
  Factory<SchemaInput<I>, SchemaOutput<I>> & Guard<SchemaOutput<I>>
> => ({
  create(kind) {
    return {
      create({ name, ...parameters }) {
        return { kind, name, ...parameters } as SchemaOutput<I>
      },
      is(value): value is SchemaOutput<I> {
        return (
          typeof value === 'object' &&
          value !== null &&
          'kind' in value &&
          value.kind === kind
        )
      },
    }
  },
})

export const boolean = schemaFactory<{
  kind: 'boolean'
  FlatValue: boolean
  JSONValue: boolean
  Parameters: {}
}>().create('boolean')

export const string = schemaFactory<{
  kind: 'string'
  FlatValue: string
  JSONValue: string
  Parameters: {}
}>().create('string')

export const union = <S extends SchemaType>(schemas: S[]) => {
  return schemaFactory<{
    kind: 'union'
    FlatValue: Key
    JSONValue: JSONValue<S>
    Parameters: {
      options: S[]
    }
  }>()
    .create('union')
    .create({
      name: `union_of_${schemas.map((s) => s.name).join('_or_')}`,
      options: schemas,
    })
}

const BooleanSchema = boolean.create({ name: 'boolean' })
const StringSchema = string.create({ name: 'string' })
const UnionSchema = union([BooleanSchema, StringSchema])
const isBoolean = boolean.is(BooleanSchema)
