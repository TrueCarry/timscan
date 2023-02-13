import { Address } from 'ton-core/dist/address/Address'
import { bigIntToBuffer } from './bigIntToBuffer'

export function bigIntToAddress(wc: number, data: bigint): Address {
  return new Address(wc, bigIntToBuffer(data))
}
