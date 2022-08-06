/* eslint-disable camelcase */
import axios from 'axios'
import { LITE_API_ENDPOINT } from './config.js'
import { base64ToHex, hexToAddress, dechex } from '~/utils.js'
import {
  Address,
  Cell,
  parseTransaction,
  RawAccountStorage,
  RawCurrencyCollection,
  RawStorageInfo,
  RawTransactionDescription,
} from '@/ton/src'
import { tonNode_blockIdExt } from 'ton-lite-client/dist/schema'
import AppDb from '~/db'
import { AccountPlainState, AccountStateToPlain } from './models/AccountState.js'
import { PlainTransaction, Transaction, TransactionGeneric } from './models/Transaction.js'
import BN from 'bn.js'
import lc from './liteClient.js'
import { RawTransactionDescriptionGeneric } from './ton/src/block/parse.js'

const db = new AppDb()

/**
 * @param  {String} address
 * @return {Promise<Object>}
 */
export const detectAddress = async function (address) {
  const { data } = await axios.get(`${LITE_API_ENDPOINT}/detectAddress`, { params: { address } })

  if (!data.ok) {
    throw data.error
  }

  return data.result
}

export interface AccountState {
  state: {
    address: Address | null
    storageStat: RawStorageInfo
    storage: RawAccountStorage
  } | null
  lastTx: {
    lt: string
    hash: Buffer
  } | null
  balance: RawCurrencyCollection
  raw: Buffer
  proof: Buffer
  block: tonNode_blockIdExt
  shardBlock: tonNode_blockIdExt
  shardProof: Buffer
}
/**
 * @param  {String} address
 * @return {Promise<Object>}
 */
export const getAddressInfo = async function (
  address: string,
  forceUpdate?: boolean
): Promise<AccountPlainState> {
  console.log('getAddressInfo', address, forceUpdate)

  const rawAddress = Address.parse(address).toString()

  if (!forceUpdate) {
    const existing = await db.accounts.where('address').equals(rawAddress).first()

    console.log('got existing========', existing)
    if (existing) {
      console.log('existing check')

      if (existing.lastUpdated && Date.now() - existing.lastUpdated < 60 * 1000) {
        return existing
      }
    }
  }
  let result: AccountState

  const block = await lc.getMasterchainInfo()
  try {
    console.log('get account state', Address.parse(address), block.last)
    const response = await lc.getAccountState(Address.parse(address), block.last)
    // const response = await axios.get(`${LITE_API_ENDPOINT}/getWalletInformation`, { params: { address }});
    result = response as unknown as AccountState
  } catch (error) {
    // if ('response' in error && !error.response.data.ok) {
    //     return { invalid: true };
    // }

    // See ya in Sentry!
    console.log('error', error)
    throw error
  }
  const plain = AccountStateToPlain(result, Date.now(), block.last.seqno)

  const putRes = await db.accounts.put(
    plain

    // {
    //   address: rawAddress,
    //   raw: result.raw.toString(),
    //   ...AccountStateToPlain(result),
    // },
    // rawAddress
  )
  console.log(putRes)
  return plain

  // return Object.freeze({ address,
  //     invalid: false,
  //     is_wallet: result.wallet,
  //     balance: result.balance,
  //     is_active: result.account_state === 'active',
  //     is_frozen: result.account_state === 'frozen',
  //     wallet_type: result.wallet_type || 'Unknown',
  //     last_tx_lt: result.last_transaction_id?.lt,
  //     last_tx_hash: result.last_transaction_id?.hash,
  // });
}

/**
 * @param  {String} address
 * @param  {Number} lt
 * @param  {String} hash
 * @param  {Number} limit
 * @return {Promise<Array>}
 */
export const getTransactions = async function (
  _address: string,
  lt: string,
  hash: Buffer,
  limit: number,
  allowMore?: boolean,
  checkForNew?: boolean
): Promise<PlainTransaction[]> {
  const rawAddress = Address.parse(_address).toString()
  const existing = await getExistingTransactions(rawAddress, lt, hash, limit, allowMore)
  if (existing) {
    return existing
  }

  console.log('limit transactions', limit)
  const address = Address.parse(_address)
  const result = await lc.getAccountTransactions(address, lt, hash, limit)
  const cell = Cell.fromBoc(result.transactions)
  console.log('got tx', cell, result, limit)

  const ltToHash: Map<string, Buffer> = new Map()
  ltToHash.set(lt, hash)

  const transactions = cell.map((c) => {
    const tx = parseTransaction(address.workChain, c.beginParse())
    ltToHash.set(tx.prevTransaction.lt.toString(), tx.prevTransaction.hash)
    return tx
  })

  //   const {
  //     data: { result },
  //   } = await axios.get(`${LITE_API_ENDPOINT}/getTransactions`, { params: query })

  const txes = transactions.map((tx, i): PlainTransaction => {
    const lt = tx.lt.toString()
    const hash = ltToHash.get(lt)

    if (!hash) {
      throw new Error('Tx hash not found')
    }

    return Object.freeze({
      address: address.toString(),
      lt,
      hash: hash.toString('hex'),
      data: cell[i].toBoc().toString('base64'),
      prevLt: tx.prevTransaction.lt.toString(),
      prevHash: tx.prevTransaction.hash.toString('hex'),
    })
  })

  await db.transactions.bulkPut(txes)

  return txes
}

async function getExistingTransactions(
  rawAddress: string,
  lt: string,
  hash: Buffer,
  limit: number,
  allowMore?: boolean
): Promise<PlainTransaction[] | null> {
  const existing = await db.transactions
    .where('address')
    .equals(rawAddress)
    .limit(allowMore ? 100 : limit)
    .and((tx) => {
      // console.log('check lt', tx.lt)
      return new BN(tx.lt).lte(new BN(lt))
    })
    .reverse()
    .sortBy('lt')
  // .toArray()

  console.log(
    'existing transactions',
    existing,
    existing.map((tx) => tx.lt)
  )

  if (!existing || !existing.length) {
    return null
  }

  if (existing[0].lt !== lt) {
    console.log('existing lt not same', existing[0].lt, lt)
    return null
  } else {
    console.log('lt same', existing[0].lt, lt)
  }

  // check that list is linked
  // if not linked - do not return
  if (existing.length > 1) {
    for (let i = existing.length - 1; i > 0; i--) {
      const curr = existing[i]
      const next = existing[i - 1]

      if (curr.lt !== next.prevLt) {
        console.log('lt not match', curr.lt, next.prevLt)
        return null
      }
    }
  }

  if (existing.length >= limit) {
    return existing
  }

  const last = existing[existing.length - 1]
  const tx = parseTransaction(0, Cell.fromBoc(Buffer.from(last.data, 'base64'))[0].beginParse())
  if (tx.prevTransaction.lt.toNumber() === 0) {
    return existing
  }

  return null
}

function txInput(tx: Transaction) {
  if (tx.description.type === 'generic') {
    console.log(tx.description)
    genericDescription(tx.description)
    // txGenericInput({
    //   ...tx,
    //   description: tx.description,
    // })
    // tx as TransactionGeneric)
  }
}

function txGenericInput(tx: TransactionGeneric) {
  console.log('generic')
}

function genericDescription(d: RawTransactionDescriptionGeneric) {
  console.log('ok')
}

/**
 * @param  {String} options.address
 * @param  {Number} options.lt
 * @param  {String} options.hash
 * @param  {Number} options.to_lt
 * @return {Promise<Object>}
 */
export const getTransaction = async function ({
  address,
  lt,
  hash,
}: {
  address: string
  lt: string
  hash: Buffer
}) {
  try {
    const parsedAddress = Address.parse(address)
    const rawAddress = parsedAddress.toString()

    const existing = await getExistingTransaction(rawAddress, lt)
    console.log('exisintg???', existing)
    if (existing) {
      return existing
    }

    console.log('await', 11, lt, hash)
    const result = await lc.getAccountTransactions(parsedAddress, lt, hash, 1)
    console.log('result', result)

    const parsedTx = parseTransaction(0, Cell.fromBoc(result.transactions)[0].beginParse())
    const tx = Object.freeze({
      address: address.toString(),
      lt,
      hash: hash.toString('hex'),
      data: Cell.fromBoc(result.transactions)[0].toBoc().toString('base64'),
      prevLt: parsedTx.prevTransaction.lt.toString(),
      prevHash: parsedTx.prevTransaction.hash.toString('hex'),
    })

    await db.transactions.put(tx)

    return tx
  } catch (e) {
    console.log('[getTransaction] Error', e)
    throw e
  }
}

async function getExistingTransaction(
  rawAddress: string,
  lt: string
): Promise<PlainTransaction | null> {
  const existing = await db.transactions
    .where('address')
    .equals(rawAddress)
    .limit(1)
    .reverse()
    .and((tx) => {
      // console.log('check lt', tx.lt)
      return new BN(tx.lt).eq(new BN(lt))
    })
    .first()

  console.log('got existing tx', existing, rawAddress, lt, existing?.lt)

  if (!existing) {
    return null
  }

  if (lt !== existing.lt) {
    return null
  }

  return existing
}

/**
 * @param  {Number} options.workchain
 * @param  {Number} options.shard
 * @param  {Number} options.seqno
 * @return {Promise<Object>}
 */
export const getBlockTransactions = async function ({ workchain, shard, seqno }) {
  const query = { workchain, shard, seqno }

  const {
    data: { result },
  } = await axios.get(`${LITE_API_ENDPOINT}/getBlockTransactions`, { params: query })

  // Convert address hex notation to base64:
  result.transactions.forEach((tx) => (tx.account = hexToAddress(tx.account)))

  return result
}

/**
 * @param  {Number} options.seqno
 * @return {Promise<Object>}
 */
export const getShards = async function ({ seqno }) {
  const {
    data: { result },
  } = await axios.get(`${LITE_API_ENDPOINT}/shards`, { params: { seqno } })

  // Convert shard decimal id to hex:
  result.shards.forEach((block) => (block.shard = dechex(block.shard)))

  return result
}

/**
 * @return {Promise<Object>}
 */
export const getLastBlock = async function () {
  const {
    data: { result },
  } = await axios.get(`${LITE_API_ENDPOINT}/getMasterchainInfo`)

  result.last.shard = dechex(result.last.shard)

  return Object.freeze(result.last)
}
