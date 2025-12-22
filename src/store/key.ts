import type { Branded } from '../utils/branded'
import { type Guard, isString } from '../utils/guard'

export type Key = Branded<string, 'Key'>

export const isKey = isString as Guard<Key>
