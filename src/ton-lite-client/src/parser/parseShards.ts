import BN from 'bn.js'
import { parseDict, Slice } from '../../../ton/src'
import { TLReadBuffer } from 'ton-tl/dist/buffer/TLReadBuffer'

// Source: https://github.com/ton-foundation/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/crypto/block/mc-config.cpp#L1232
export function parseShards(cs: Slice) {
  if (!cs.readBit()) {
    throw Error('Invalid slice')
  }
  return parseDict(cs.readRef(), 32, (cs2) => {
    const stack: { slice: Slice; shard: BN }[] = [
      { slice: cs2.readRef(), shard: new BN(1).shln(63) },
    ]
    const res: Map<string, number> = new Map()
    while (stack.length > 0) {
      const item = stack.pop()!
      const slice = item.slice
      const shard = item.shard

      const t = slice.readBit()
      if (!t) {
        slice.skip(4)
        const seqno = slice.readUintNumber(32)
        const id = new TLReadBuffer(shard.toBuffer('le', 32)).readInt64() // Unsigned to Signed
        res.set(id, seqno)
        continue
      }

      const delta = shard.and(shard.notn(64).addn(1)).shrn(1)
      stack.push({ slice: slice.readRef(), shard: shard.sub(delta) })
      stack.push({ slice: slice.readRef(), shard: shard.add(delta) })
    }
    return res
  })
}
