import axios from 'axios'
import { IS_TESTNET } from '@/config'
import { LiteClient, LiteRoundRobinEngine, LiteSingleEngine } from 'ton-lite-client'
import networkConfig from '@/networkConfig'
import { delay } from './utils/callTonApi'

const { tmpClient, endWait } = getTempClient()
let liteClient: LiteClient = tmpClient
let initCalled = false

function getTempClient() {
  interface queueItem {
    method: string
    args: unknown[]
    resolve: () => void
    reject: () => void
  }

  const queue: queueItem[] = []
  let localClient: LiteClient | undefined

  const createShim = (name: string) => {
    return (...args: unknown[]) => {
      if (localClient) {
        return localClient[name](...args)
      }

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      let _resolve: () => void = () => {}
      // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-explicit-any
      let _reject: (reason?: any) => void = () => {}

      const p = new Promise<void>((resolve, reject) => {
        _resolve = resolve
        _reject = reject
      })

      queue.push({
        method: name,
        args: [...args],
        resolve: _resolve,
        reject: _reject,
      })

      return p
    }
  }
  const tempWait = {}
  for (const name of [
    'getMasterchainInfo',
    'getAccountState',
    'getAccountTransactions',
    'sendMessage',
    'getMasterchainInfoExt',
    'getCurrentTime',
    'getVersion',
    'getConfig',
    'getAccountTransaction',
    'runMethod',
    'lookupBlockByID',
    'getBlockHeader',
    'getAllShardsInfo',
    'listBlockTransactions',
    'getFullBlock',
  ]) {
    tempWait[name] = createShim(name)
  }

  const endWait = (client: LiteClient) => {
    localClient = client
    for (const item of queue) {
      // console.log('item work', item, lc)
      if (client && client[item.method]) {
        client[item.method](...item.args)
          .then(item.resolve)
          .catch(item.reject)
      }
    }
  }

  return {
    tmpClient: tempWait as LiteClient,
    endWait,
  }
}

async function initLiteClient() {
  if (initCalled) {
    return
  }
  initCalled = true

  let data = IS_TESTNET ? networkConfig.testnetConfig : networkConfig.mainnetConfig

  const engines: LiteSingleEngine[] = []

  let wsProxyHost = 'wss://ws.tonlens.com'
  if (typeof window.localStorage !== 'undefined') {
    const localProxy = window.localStorage.getItem('wsProxyHost')
    if (localProxy) {
      wsProxyHost = localProxy
    }

    const lsData = window.localStorage.getItem('liteServers')
    if (lsData) {
      try {
        const config = JSON.parse(lsData)
        if (config) {
          data = config
        }
      } catch {
        //
      }
    }
  }

  while (true) {
    const ls = data.liteservers[Math.floor(Math.random() * data.liteservers.length)]
    const pubkey = encodeURIComponent(ls.id.key)
    const singleEngine = new LiteSingleEngine({
      host: `${wsProxyHost}/?ip=${ls.ip}&port=${ls.port}&pubkey=${pubkey}`,
      publicKey: Buffer.from(ls.id.key, 'base64'),
      client: 'ws',
    })

    const check = await checkEngine(singleEngine)
    singleEngine.close()
    if (!check) {
      continue
    }

    engines.push(
      new LiteSingleEngine({
        host: `${wsProxyHost}/?ip=${ls.ip}&port=${ls.port}&pubkey=${pubkey}`,
        publicKey: Buffer.from(ls.id.key, 'base64'),
        client: 'ws',
      })
    )
    break
  }

  const engine = new LiteRoundRobinEngine(engines)
  const client = new LiteClient({ engine })

  liteClient = client

  endWait(client)

  setInterval(async () => {
    await liteClient.getMasterchainInfo()
  }, 30000)
}

function intToIP(int: number) {
  const part1 = int & 255
  const part2 = (int >> 8) & 255
  const part3 = (int >> 16) & 255
  const part4 = (int >> 24) & 255

  return `${part4}.${part3}.${part2}.${part1}`
}

export default liteClient

export { initLiteClient, liteClient }

async function checkEngine(engine: LiteSingleEngine): Promise<boolean> {
  console.log('check  engine')
  let resolve, reject
  const promise = new Promise<boolean>((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })

  const doChecks = async () => {
    const client = new LiteClient({ engine })

    let rejected = false
    setTimeout(() => {
      rejected = true
      resolve(false)
    }, 1000)

    while (true) {
      if (rejected) {
        break
      }
      try {
        await client.getCurrentTime()
        resolve(true)
        break
      } catch (e) {
        await delay(16)
      }
    }
  }

  doChecks()
  return promise
}
