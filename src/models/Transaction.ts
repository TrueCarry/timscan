import {
  RawAccountStatus,
  RawCurrencyCollection,
  RawHashUpdate,
  RawTransactionDescription,
  RawMessage,
  Address,
} from '@/ton/src'
import BN from 'bn.js'
import { CurrencyCollection } from './AccountState'

// export type PlainTransaction = {
//   address: Address
//   lt: string // bn
//   hash?: string // optional hash
//   prevTransaction: {
//     lt: string // bn
//     hash: string // buffer to base64
//   }
//   time: number
//   outMessagesCount: number
//   oldStatus: RawAccountStatus
//   newStatus: RawAccountStatus
//   fees: CurrencyCollection
//   // update: RawHashUpdate
//   description: RawTransactionDescription
//   inMessage: RawMessage | null
//   outMessages: RawMessage[]
// }

export interface PlainTransaction {
  address: string // raw
  lt: string // bigint
  hash: string // base64
  data: string // base64

  prevLt: string
  prevHash: string
}
