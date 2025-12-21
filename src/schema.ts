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

type SchemaInput<I extends SchemaDefinition> = I['Parameters'] & {
  name: string
  kind: I['kind']
}

type SchemaOutput<I extends SchemaDefinition> = SchemaType &
  I['Parameters'] & {
    kind: I['kind']
    [TypeInformation]: {
      FlatValue: I['FlatValue']
      JSONValue: I['JSONValue']
    }
  }

function createSchemaFactory<I extends SchemaDefinition>(): Factory<
  SchemaInput<I>,
  SchemaOutput<I>
> {
  return {
    create({ kind, name, ...parameters }) {
      return { kind, name, ...parameters } as SchemaOutput<I>
    },
  }
}

export const boolean = (name: string) =>
  createSchemaFactory<{
    kind: 'boolean'
    FlatValue: boolean
    JSONValue: boolean
    Parameters: {}
  }>().create({ kind: 'boolean', name })

export const string = (name: string) =>
  createSchemaFactory<{
    kind: 'string'
    FlatValue: string
    JSONValue: string
    Parameters: {}
  }>().create({ kind: 'string', name })

export const union = <S extends SchemaType>(schemas: S[]) => {
  return createSchemaFactory<{
    kind: 'union'
    FlatValue: Key
    JSONValue: JSONValue<S>
    Parameters: {
      options: S[]
    }
  }>().create({
    kind: 'union',
    name: `union_of_${schemas.map((s) => s.name).join('_or_')}`,
    options: schemas,
  })
}

const BooleanSchema = boolean('boolean')
const StringSchema = string('string')
const UnionSchema = union([BooleanSchema, StringSchema])
