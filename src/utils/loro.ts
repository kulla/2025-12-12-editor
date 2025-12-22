import { LoroList, LoroMap } from 'loro-crdt'
import { isInstanceOf } from './guard'

export const isLoroList = isInstanceOf(LoroList)

export const isLoroMap = isInstanceOf(LoroMap)
