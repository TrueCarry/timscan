import BN from 'bn.js'
import ethUnit from 'ethjs-unit'

export function toNano(src: number | string | BN) {
  return ethUnit.toWei(src, 'gwei') as BN
}

export function fromNano(src: BN | number | string) {
  return ethUnit.fromWei(src, 'gwei') as string
}
