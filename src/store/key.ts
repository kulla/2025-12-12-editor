import type { Branded } from '../utils/branded'
import { type Guard, isString } from '../utils/guard'

export type Key = Branded<string, 'Key'>

export const isKey = isString as Guard<Key>

export interface KeyGenerator {
  next(): Key
}

export class PrefixKeyGenerator implements KeyGenerator {
  private counter = 0

  constructor(private readonly prefix: string) {}

  next(): Key {
    this.counter += 1

    return (this.prefix + this.counter) as Key
  }
}
