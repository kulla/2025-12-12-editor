import type { JSONValue, Schema } from '../schema/types'

export interface NestedNode<S extends Schema = Schema> {
  schema: S
  value: JSONValue<S>
}
