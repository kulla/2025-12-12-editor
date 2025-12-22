import type { Branded } from '../utils/branded'

export type Key = Branded<string, 'Key'>

export function isKey(value: unknown): value is Key {
  return typeof value === 'string'
}
