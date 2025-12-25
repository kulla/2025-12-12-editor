import * as S from '../schema/kinds'
import type { Schema } from '../schema/types'
import type { Root } from './types'

export function createSchemaRegistry(
  rootSchema: Root,
): Record<string, Schema | undefined> {
  return Object.fromEntries(
    collectSchemas(rootSchema).map((schema) => [schema.name, schema]),
  )
}

function collectSchemas(schema: Schema): Schema[] {
  const collected = new Set<Schema>()
  const toProcess: Schema[] = [schema]

  while (true) {
    const current = toProcess.pop()

    if (current == null) {
      break
    }

    if (collected.has(current)) {
      continue
    } else {
      collected.add(current)
    }

    if (S.isPrimitiveSchema(current)) {
    } else if (S.isWrapperSchema(current)) {
      toProcess.push(current.wrappedSchema)
    } else if (S.isUnionSchema(current)) {
      for (const optionSchema of current.options) {
        toProcess.push(optionSchema)
      }
    } else if (S.isArraySchema(current)) {
      toProcess.push(current.itemSchema)
    } else if (S.isObjectSchema(current)) {
      for (const propertySchema of Object.values(current.properties)) {
        toProcess.push(propertySchema)
      }
    }
  }

  return [...collected]
}
