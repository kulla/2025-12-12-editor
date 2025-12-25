import type { Root } from '../content/types'
import * as S from './index'

export function createSchemaRegistry(
  rootSchema: Root,
): Record<string, S.Schema | undefined> {
  return Object.fromEntries(
    collectSchemas(rootSchema).map((schema) => [schema.name, schema]),
  )
}

function collectSchemas(schema: S.Schema): S.Schema[] {
  const collected = new Set<S.Schema>()
  const toProcess: S.Schema[] = [schema]

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
