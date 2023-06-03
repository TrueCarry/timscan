// import { RawAccountStorage, RawCurrencyCollection, RawStateInit, RawStorageInfo } from 'ton-core'
import { bigIntToBuffer } from '@/utils/bigIntToBuffer'
import { beginCell } from 'ton-core/dist/boc/Builder'
import { AccountState } from '../api'

export type CurrencyCollection = {
  currencies: { [id: number]: number } | null
  coins: string
}

// export type PlainStateInit = {
//   splitDepth: number | null
//   code: string | null
//   data: string | null
// }

export type PlainAccountState =
  | { type: 'uninit' }
  | { type: 'active'; code: string | null; data: string | null; libraries: string | null }
  | { type: 'frozen'; stateHash: string }

export interface PlainAccountStorage {
  lastPaid: number
  duePayment: string | null

  used: {
    bits: number
    cells: number
    publicCells: number
  }
}

export interface AccountPlainState {
  // state: {
  //   storageStat: RawStorageInfo
  //   storage: RawAccountStorage
  // } | null
  address: string | null
  state: PlainAccountState
  storage: PlainAccountStorage | null
  lastTx: {
    lt: string
    hash: string
  } | null
  balance: CurrencyCollection

  lastUpdated?: number
  lastUpdatedSeqno?: number
  // raw: Buffer
  // proof: Buffer
  // block: tonNode_blockIdExt
  // shardBlock: tonNode_blockIdExt
  // shardProof: Buffer
}

export function AccountStateToPlain(
  account: AccountState,
  lastUpdated?: number,
  lastUpdatedSeqno?: number
): AccountPlainState {
  // Resolve state
  let state: PlainAccountState
  let storage: PlainAccountStorage | null
  if (account.state) {
    storage = {
      lastPaid: account.state.storageStats.lastPaid,
      duePayment: account.state.storageStats.duePayment
        ? account.state.storageStats.duePayment.toString(10)
        : null,
      used: {
        bits: Number(account.state.storageStats.used.bits),
        cells: Number(account.state.storageStats.used.cells),
        publicCells: Number(account.state.storageStats.used.publicCells),
      },
    }
    if (account.state.storage.state.type === 'uninit') {
      state = {
        type: 'uninit',
      }
    } else if (account.state.storage.state.type === 'active') {
      state = {
        type: 'active',
        code: account.state.storage.state.state.code
          ? account.state.storage.state.state.code.toBoc({ idx: false }).toString('base64')
          : null,
        data: account.state.storage.state.state.data
          ? account.state.storage.state.state.data.toBoc({ idx: false }).toString('base64')
          : null,
        libraries: account.state.storage.state.state.libraries
          ? beginCell()
              .store(account.state.storage.state.state.libraries.store)
              .endCell()
              .toBoc({ idx: false })
              .toString('base64')
          : null,
      }
    } else {
      state = {
        type: 'frozen',
        stateHash: account.state.storage.state.stateHash.toString(),
      }
    }
  } else {
    storage = null
    state = { type: 'uninit' }
  }

  // Convert currencies
  const currencies: { [id: number]: number } = {}
  if (account.balance.other) {
    for (const ec of account.balance.other) {
      currencies[ec[0]] = Number(ec[1])
    }
  }

  // const lastTxHash = undefined
  // if (account.lastTx) {
  //   lastTxHash =
  // }
  return {
    // account: {
    address: account.state?.addr?.toString() || null,
    state,
    storage,
    balance: {
      coins: account.balance.coins.toString(10),
      currencies,
    },
    lastTx: account.lastTx
      ? {
          lt: account.lastTx.lt.toString(),
          hash: bigIntToBuffer(account.lastTx.hash).toString('base64'),
        }
      : null,

    lastUpdated,
    lastUpdatedSeqno,
    // },
    // block: {
    //   workchain: mcInfo.id.workchain,
    //   seqno: mcInfo.id.seqno,
    //   shard: mcInfo.id.shard,
    //   fileHash: mcInfo.id.fileHash.toString('base64'),
    //   rootHash: mcInfo.id.rootHash.toString('base64'),
    // },
  }
}
