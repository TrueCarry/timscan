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
} from '@/ton/src'
import { tonNode_blockIdExt } from '@/ton-lite-client/src/schema'
import AppDb from '~/db'
import { AccountPlainState, AccountStateToPlain } from './models/AccountState.js'
import { PlainTransaction } from './models/Transaction.js'
import BN from 'bn.js'
import lc from './liteClient.js'

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

  const db = new AppDb()
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
  console.log('get address info ====== ', address)
  let result: AccountState

  const block = await lc.getMasterchainInfo()
  try {
    const response = await lc.getAccountState(Address.parse(address), block.last)
    console.log('got address=====', address)
    // const response = await axios.get(`${LITE_API_ENDPOINT}/getWalletInformation`, { params: { address }});
    result = response as unknown as AccountState
  } catch (error) {
    // if ('response' in error && !error.response.data.ok) {
    //     return { invalid: true };
    // }

    // See ya in Sentry!
    console.log('error', error)
    console.error(error)
    throw error
  }
  console.log('got res=======', result)
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
  allowMore?: boolean
): Promise<PlainTransaction[]> {
  const db = new AppDb()
  //   const query = {
  //     address,
  //     lt,
  //     limit,
  //     hash: base64ToHex(hash),
  //     api_key: 'd852b54d062f631565761042cccea87fa6337c41eb19b075e6c7fb88898a3992',
  //   }
  console.log('get txes', lt, hash)
  const rawAddress = Address.parse(_address).toString()
  const existing = await db.transactions
    .where('address')
    .equals(rawAddress)
    .limit(allowMore ? 100 : limit)
    .and((tx) => {
      console.log('check lt', tx.lt)
      return new BN(tx.lt).lte(new BN(lt))
    })
    .reverse()
    .sortBy('lt')
  // .toArray()

  console.log('existing transactions', existing)
  if (existing && existing.length > 0) {
    if (existing.length >= limit) {
      return existing
    }

    const last = existing[existing.length - 1]
    const tx = parseTransaction(0, Cell.fromBoc(Buffer.from(last.data, 'base64'))[0].beginParse())
    if (tx.prevTransaction.lt.toNumber() === 0) {
      return existing
    }
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
    return Object.freeze({
      address: address.toString(),
      lt: tx.lt.toString(),
      hash: ltToHash.get(tx.lt.toString())!.toString('hex'),
      data: cell[i].toBoc().toString('base64'),
    })
  })

  await db.transactions.bulkPut(txes)

  // for (const tx of txes) {
  // await db.transactions.add(tx).catch((e) => {
  //   if (
  //     e.message ===
  //     'Key already exists in the object store.\n ConstraintError: Key already exists in the object store.'
  //   ) {
  //     return
  //   }

  //   throw e
  // })
  // }

  return txes
  // const isService = !tx.inMessage && tx.outMessagesCount < 1
  // //   !tx.in_msg && tx.out_msgs.length < 1

  // const sourceAddress = tx.inMessage?.info.src || tx.outMessages[0]?.info.src
  // const destAddress = tx.outMessages[0]?.info.src || tx.inMessage?.info.dest

  // const isOut = sourceAddress && address.equals(sourceAddress)
  // const from = isOut ? address : sourceAddress
  // const to = isOut ? destAddress : address

  // const transactionId = Object.freeze({
  //   lt: tx.lt,
  //   hash: tx.lt,
  // })

  // const msgObject = isOut ? tx.outMessages[0] : tx.inMessage
  // const bodyParse = msgObject?.body.beginParse()
  // const message =
  //   bodyParse &&
  //   bodyParse.remaining > 0 &&
  //   bodyParse.remaining % 8 === 0 &&
  //   bodyParse.readRemainingBytes().toString('utf-8')
  // const amount = msgObject?.info.type === 'internal' && msgObject.info.value

  // const message = msgObject?.msg_data?.['@type'] == 'msg.dataText' ? msgObject?.message : null
  // const amount = msgObject?.value
  // const amount = msgObject?

  // return Object.freeze({
  // ...tx,
  // isService,
  // isOut,
  // message,
  // transactionId,
  // amount: amount || 0,
  // to: to || address,
  // from: from || address,
  // timestamp: parseInt(tx.time + '000'),
  // fee: tx.fees.coins.toNumber(),
  //   })
  // })
}

/**
 * @param  {String} options.address
 * @param  {Number} options.lt
 * @param  {String} options.hash
 * @param  {Number} options.to_lt
 * @return {Promise<Object>}
 */
export const getTransaction = async function ({ address, lt, hash, to_lt }) {
  const query = { address, lt, to_lt, limit: 1, hash: base64ToHex(hash) }

  const {
    data: { result },
  } = await axios.get(`${LITE_API_ENDPOINT}/getTransactions`, { params: query })

  return Object.freeze(result.find((tx) => tx.transaction_id?.hash === hash))
}

/**
 * @param  {Number} options.workchain
 * @param  {Number} options.shard
 * @param  {Number} options.seqno
 * @return {Promise<Object>}
 */
export const getBlockHeader = async function ({ workchain, shard, seqno }) {
  const query = { workchain, shard, seqno }

  const {
    data: { result },
  } = await axios.get(`${LITE_API_ENDPOINT}/getBlockHeader`, { params: query })

  // Convert shard decimal id to hex:
  result.prev_blocks.forEach((block) => (block.shard = dechex(block.shard)))

  return Object.freeze(result)
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
