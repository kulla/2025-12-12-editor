import type { AwarenessListener } from 'loro-crdt'
import type { CDRT } from './types'

export function syncCDRTs(cdrt1: CDRT, cdrt2: CDRT) {
  const { doc: loro1, awareness: awareness1 } = cdrt1
  const { doc: loro2, awareness: awareness2 } = cdrt2

  // Code taken from https://prosekit.dev/extensions/loro/
  loro1.import(loro2.export({ mode: 'update' }))
  loro2.import(loro1.export({ mode: 'update' }))

  const unsubscribeA = loro1.subscribeLocalUpdates((bytes) =>
    loro2.import(bytes),
  )
  const unsubscribeB = loro2.subscribeLocalUpdates((bytes) =>
    loro1.import(bytes),
  )

  const awarenessAListener: AwarenessListener = (_, origin) => {
    if (origin === 'local') {
      awareness2.apply(awareness1.encode([loro1.peerIdStr]))
    }
  }
  const awarenessBListener: AwarenessListener = (_, origin) => {
    if (origin === 'local') {
      awareness1.apply(awareness2.encode([loro2.peerIdStr]))
    }
  }
  awareness1.addListener(awarenessAListener)
  awareness2.addListener(awarenessBListener)

  return () => {
    unsubscribeA()
    unsubscribeB()
    awareness1.removeListener(awarenessAListener)
    awareness2.removeListener(awarenessBListener)
  }
}
