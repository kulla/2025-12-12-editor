import type { Key } from './store/key'

export type FlatValue<S extends SchemaType> =
  S[typeof TypeInformation]['FlatValue']

export type JSONValue<S extends SchemaType> =
  S[typeof TypeInformation]['JSONValue']

const schemaFactory = <I extends SchemaDefinition>(
  kind: I['kind'],
): Factory<SchemaInput<I>, SchemaOutput<I>> => ({
  create: ({ name, ...parameters }) => {
    return { kind, name, ...parameters } as SchemaOutput<I>
  },
})

export const boolean = schemaFactory<{
  kind: 'boolean'
  FlatValue: boolean
  JSONValue: boolean
  Parameters: {}
}>('boolean')

export const string = schemaFactory<{
  kind: 'string'
  FlatValue: string
  JSONValue: string
  Parameters: {}
}>('string')

export const union = <S extends SchemaType>(schemas: S[]) => {
  return schemaFactory<{
    kind: 'union'
    FlatValue: Key
    JSONValue: JSONValue<S>
    Parameters: {
      options: S[]
    }
  }>('union').create({
    name: `union_of_${schemas.map((s) => s.name).join('_or_')}`,
    options: schemas,
  })
}

const BooleanSchema = boolean.create({ name: 'isActive' })
const StringSchema = string.create({ name: 'username' })
const UnionSchema = union([BooleanSchema, StringSchema])

export interface SchemaType {
  kind: string
  name: string
  [TypeInformation]: {
    FlatValue: unknown
    JSONValue: unknown
  }
}

declare const TypeInformation: unique symbol

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

interface SchemaDefinition {
  kind: string
  FlatValue: unknown
  JSONValue: unknown
  Parameters: {}
}

interface Factory<I, O> {
  create(input: I): O
}
