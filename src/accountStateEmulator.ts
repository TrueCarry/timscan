/* eslint-disable camelcase */
import {
  Account,
  Address,
  Cell,
  ShardAccount,
  beginCell,
  loadShardAccount,
  loadTransaction,
  storeAccount,
  storeMessage,
  storeShardAccount,
  storeTransaction,
} from 'ton-core'

import { BlockID, LiteClient } from 'ton-lite-client'
import DataLoader from 'dataloader'
import { LRUMap } from 'lru_map'
import { Executor } from '@ton-community/sandbox/dist/executor/Executor'
import { liteServer_transactionInfo } from 'ton-lite-client/dist/schema'

const blocksCache = new LRUMap<
  number,
  Promise<{
    shards: {
      rootHash: Buffer
      fileHash: Buffer
      transactions: {
        hash: Buffer
        lt: string
        account: Buffer
      }[]
      workchain: number
      seqno: number
      shard: string
    }[]
  }>
>(10000)
const blockLoader = new DataLoader<
  {
    blockId: number
    liteClient: LiteClient
  },
  {
    shards: {
      rootHash: Buffer
      fileHash: Buffer
      transactions: {
        hash: Buffer
        lt: string
        account: Buffer
      }[]
      workchain: number
      seqno: number
      shard: string
    }[]
  },
  number
>(
  async (ids) => {
    return Promise.all(
      ids.map(async (id) => {
        return id.liteClient.getFullBlock(id.blockId)
      })
    )
  },
  {
    batch: false,
    cacheMap: blocksCache,
    cacheKeyFn: (id) => id.blockId,
  }
)
async function getCachedBlock(
  seqno: number,
  liteClient: LiteClient
): Promise<{
  shards: {
    rootHash: Buffer
    fileHash: Buffer
    transactions: { hash: Buffer; lt: string; account: Buffer }[]
    workchain: number
    seqno: number
    shard: string
  }[]
}> {
  return blockLoader.load({
    blockId: seqno,
    liteClient,
  })
}

function bigIntToBuffer(data: bigint | undefined): Buffer {
  if (!data) {
    return Buffer.from([])
  }
  const hexStr = data.toString(16)
  const pad = hexStr.padStart(64, '0')
  const hashHex = Buffer.from(pad, 'hex')

  return hashHex
}

const txesCache = new LRUMap<string, Promise<liteServer_transactionInfo>>(10000)
const txLoader = new DataLoader<
  { src: Address; lt: string; block: BlockID; liteClient: LiteClient },
  liteServer_transactionInfo,
  string
>(
  async (ids) => {
    return Promise.all(
      ids.map(async (id) => {
        return id.liteClient.getAccountTransaction(id.src, id.lt, id.block)
      })
    )
  },
  {
    batch: false,
    cacheMap: txesCache,
    cacheKeyFn: (id) =>
      `${id.src.toRawString()}:${id.lt}:${id.block.workchain}:${id.block.shard}:${id.block.seqno}`,
  }
)

const interBlockState = new LRUMap<string, ShardAccount>(10000)
const getInterBlockStateKey = (src: Address, lt: string) => {
  return `${src.toRawString()}:${lt}`
}

const configsMap = new LRUMap<number, Promise<string>>(10000)
// const getInterBlockStateKey = (src: Address, lt: string) => {
//   return `${src.toRawString()}:${lt}`
// }

const configLoader = new DataLoader<
  {
    block: BlockID
    liteClient: LiteClient
  },
  string,
  number
>(
  async (ids) => {
    return Promise.all(
      ids.map(async (id) => {
        const networkConfig = await id.liteClient.getConfig(id.block)
        const config = beginCell()
          .storeDictDirect(networkConfig.config)
          .endCell()
          .toBoc()
          .toString('base64')
        return config
      })
    )
  },
  {
    batch: false,
    cacheMap: configsMap,
    cacheKeyFn: (id) => id.block.seqno,
  }
)

export async function getAccountStateByTransaction(
  src: Address,
  lt: string,
  hash: Buffer,
  block: BlockID,
  emulateKnownState?: boolean,
  liteClient?: LiteClient
): Promise<Account> {
  // const start = Date.now()
  const lc = liteClient

  const accountState = await lc.getAccountState(src, block)
  // If account state at block last tx is ours tx - just return it
  if (emulateKnownState) {
    if (accountState.lastTx && accountState.lastTx.lt === BigInt(lt)) {
      if (!bigIntToBuffer(accountState.lastTx.hash).equals(hash)) {
        throw new Error('Lt same, but hash not')
      }

      // console.log('tx state')
      return accountState.state
    }
  }
  console.log('tx tx', lt)

  // Our tx is not last in the block, so we must emulate it from previous known state
  // const prevChainBlock = await lc.getFullBlock(block.seqno - 1)
  // const prevChainMasterShard = prevChainBlock.shards.find((s) => s.workchain === -1)
  const prevChainMasterShard = (
    await lc.lookupBlockByID({
      workchain: -1,
      shard: '-9223372036854775808',
      seqno: block.seqno - 1,
    })
  ).id

  const currentBlock = await getCachedBlock(block.seqno, liteClient)

  const accountBlocks = currentBlock.shards
    .filter((s) => s.workchain === src.workChain)
    .sort((a, b) => a.seqno - b.seqno)

  // console.log('before state', Date.now() - start)
  const accountStateBefore = await lc.getAccountState(src, prevChainMasterShard)
  // console.log('After state', Date.now() - start)

  const shards = accountBlocks.sort((a, b) => a.seqno - b.seqno)

  const executor = await Executor.create()

  let shardAccount: ShardAccount = {
    account: accountStateBefore.state,
    lastTransactionHash: accountStateBefore.lastTx?.hash || 0n,
    lastTransactionLt: accountStateBefore.lastTx?.lt || 0n,
  }

  for (const shard of shards) {
    for (const tx of shard.transactions) {
      if (tx.account.equals(src.hash)) {
        txLoader.load({ src, lt: tx.lt, block: shard, liteClient })
      }
    }
  }

  // console.log('Before shards', Date.now() - start)
  for (const shard of shards) {
    const txes = shard.transactions
      .filter((tx) => tx.account.equals(src.hash) && BigInt(tx.lt) <= BigInt(lt)) // && )
      .sort((a, b) => Number(BigInt(a.lt) - BigInt(b.lt)))

    for (const tx of txes) {
      if (!tx.account.equals(src.hash)) {
        continue
      }

      if (interBlockState.get(getInterBlockStateKey(src, tx.lt))) {
        shardAccount = interBlockState.get(getInterBlockStateKey(src, tx.lt))
        continue
      }

      // console.log('after shards skip', Date.now() - start)

      // const txData = await lc.getAccountTransaction(src, tx.lt, shard)
      const txData = await txLoader.load({ src, lt: tx.lt, block: shard, liteClient })
      const txCell = Cell.fromBoc(txData.transaction)[0]
      const fullTx = loadTransaction(txCell.beginParse())
      const txCellHash = txCell.hash(100)
      const oldTxHash = beginCell().store(storeTransaction(fullTx)).endCell().hash()

      // console.log('after tx load', Date.now() - start)

      if (!txCellHash.equals(oldTxHash)) {
        console.log('Correct Cell', txCell.toBoc().toString('hex'))
        console.log(
          'New     Cell',
          beginCell().store(storeTransaction(fullTx)).endCell().toBoc().toString('hex')
        )
        throw new Error('Transaction serdes1 error')
      }

      if (!txCellHash.equals(tx.hash)) {
        console.log('hash', tx.hash.toString('hex'))
        console.log('Correct Cell', txData.transaction.toString('hex'))
        console.log(
          'New     Cell',
          beginCell().store(storeTransaction(fullTx)).endCell().toBoc().toString('hex')
        )
        throw new Error('Transaction serdes2 error')
      }

      const config = await configLoader.load({
        block: prevChainMasterShard,
        liteClient,
      })

      let res
      // console.log('store x', fullTx)
      if (fullTx.description.type === 'tick-tock') {
        res = executor.runTickTock({
          ignoreChksig: false,
          libs: new Cell(),
          lt: BigInt(tx.lt),
          config,
          now: fullTx.now,
          randomSeed: Buffer.alloc(32),
          verbosity: 'short',
          shardAccount: beginCell()
            .store(storeShardAccount(shardAccount))
            .endCell()
            .toBoc()
            .toString('base64'),
          // message: undefined,
          which: fullTx.description.isTock ? 'tock' : 'tick',
          debugEnabled: false,
        })
      } else {
        const messageCell = beginCell().store(storeMessage(fullTx.inMessage)).endCell()
        res = executor.runTransaction({
          ignoreChksig: false,
          libs: new Cell(),
          lt: BigInt(tx.lt),
          config,
          now: fullTx.now,
          randomSeed: Buffer.alloc(32),
          verbosity: 'short',
          shardAccount: beginCell()
            .store(storeShardAccount(shardAccount))
            .endCell()
            .toBoc()
            .toString('base64'),
          message: messageCell,
          debugEnabled: false,
        })
      }

      // let config = configsMap.get(prevChainMasterShard.seqno)
      // if (!config) {
      //   const networkConfig = await lc.getConfig(prevChainMasterShard)
      //   config = beginCell()
      //     .storeDictDirect(networkConfig.config)
      //     .endCell()
      //     .toBoc()
      //     .toString('base64')
      //   configsMap.set(prevChainMasterShard.seqno, config)
      // }
      // console.log('before tx', Date.now() - start)

      if (!res.result.success) {
        throw new Error('not success')
      }
      // console.log('after tx', Date.now() - start)

      const newTx = loadTransaction(Cell.fromBase64(res.result.transaction).asSlice())
      newTx.now = fullTx.now

      // const oldTxHash = beginCell().store(storeTransaction(fullTx)).endCell().hash() //
      const newnewTxHash = beginCell().store(storeTransaction(newTx)).endCell().hash()

      // const objDiff = diff(newTx, fullTx)

      // compareTxes(fullTx, newTx)

      // console.log('out old', fullTx.outMessages.get(0))
      // console.log('out new', newTx.outMessages.get(0))

      // console.log('in old', fullTx.inMessage)
      // console.log('in new', newTx.inMessage)

      // console.log('old tx', txCell.toString())
      // console.log('new tx', beginCell().store(storeTransaction(newTx)).endCell().toString())

      // const newParsed = loadTransaction(
      //   beginCell().store(storeTransaction(newTx)).endCell().asSlice()
      // )

      // const a = flattenTransaction(newParsed)
      // const b = flattenTransaction(fullTx)

      // const flatDiff = diff(a, b)

      // if (shardAccount.account.storage.state.type !== 'active') {
      //   throw new Error('x')
      // }
      // const contract = await SmartContract.fromCell(
      //   shardAccount.account.storage.state.state.code,
      //   shardAccount.account.storage.state.state.data,
      //   {
      //     debug: true,
      //   }
      // )
      // contract.setBalance(toNano(1000))
      // const cRes = await contract.sendMessage(fullTx.inMessage)

      const newShardAccount = loadShardAccount(Cell.fromBase64(res.result.shardAccount).asSlice())
      newShardAccount.lastTransactionHash = BigInt(`0x${newnewTxHash.toString('hex')}`)

      if (fullTx.endStatus !== 'non-existing') {
        const accountHash = beginCell()
          .storeBit(1)
          .store(storeAccount(newShardAccount.account))
          .endCell()
          .hash()

        if (!accountHash.equals(fullTx.stateUpdate.newHash)) {
          console.log(
            'tx hash',
            src.toString({ urlSafe: true, bounceable: true }),
            lt,
            hash.toString('base64')
          )
          console.log(
            'Correct Account',
            beginCell().store(storeAccount(accountState.state)).endCell().toBoc().toString('hex')
          )
          console.log(
            'New     Account',
            beginCell()
              .store(storeAccount(newShardAccount.account))
              .endCell()
              .toBoc()
              .toString('hex')
          )

          throw new Error('wrong hash')
        }
      }

      if (!newTx.stateUpdate.newHash.equals(fullTx.stateUpdate.newHash)) {
        console.log(
          'tx hash',
          src.toString({ urlSafe: true, bounceable: true }),
          lt,
          hash.toString('base64')
        )
        console.log(
          'Correct Account',
          beginCell().store(storeAccount(accountState.state)).endCell().toBoc().toString('hex')
        )
        console.log(
          'New     Account',
          beginCell().store(storeAccount(newShardAccount.account)).endCell().toBoc().toString('hex')
        )

        throw new Error('wrong state hash')
      }

      if (!newnewTxHash.equals(oldTxHash)) {
        console.log(
          'Correct Cell',
          beginCell().store(storeTransaction(newTx)).endCell().toBoc().toString('hex')
        )
        console.log(
          'New     Cell',
          beginCell().store(storeTransaction(fullTx)).endCell().toBoc().toString('hex')
        )

        throw new Error('wrong tx hash')
      }

      shardAccount = newShardAccount
      interBlockState.set(getInterBlockStateKey(src, tx.lt), newShardAccount)

      if (shardAccount.lastTransactionLt === BigInt(lt)) {
        if (!bigIntToBuffer(shardAccount.lastTransactionHash).equals(hash)) {
          throw new Error('Last hash is wrong')
        }
      }
    }
  }

  if (shardAccount.lastTransactionLt !== BigInt(lt)) {
    throw new Error('Last lt is wrong')
  }
  if (!bigIntToBuffer(shardAccount.lastTransactionHash).equals(hash)) {
    throw new Error('Last hash is wrong')
  }

  return shardAccount.account
}
