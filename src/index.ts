import axios from 'axios'
import { LiteEngine, LiteSingleEngine, LiteRoundRobinEngine, LiteClient } from 'ton-lite-client'
import { Address } from './ton/src'

async function main() {
  console.log('main')
  const configUrl =
    process.env.TONCONFIG_URL || 'https://ton-blockchain.github.io/testnet-global.config.json'

  const { data } = await axios(configUrl)

  const engines: LiteSingleEngine[] = []
  // while (engines.length < 50) {
  for (const ls of data.liteservers.slice(0, 1)) {
    engines.push(
      new LiteSingleEngine({
        host: intToIP(ls.ip),
        port: ls.port,
        publicKey: Buffer.from(ls.id.key, 'base64'),
      })
    )
  }
  // }

  const engine: LiteEngine = new LiteRoundRobinEngine(engines)
  const liteClient = new LiteClient({ engine })
  // console.log('lc', liteClient)
  console.log('block=====')
  const block = await liteClient.getMasterchainInfo()
  console.log('block=====', block)
  const address = await liteClient.getAccountState(
    Address.parse('EQCiB7Dp1BgBysXCM5Y-IJGkHbDL-ehSzRLxSsrfzk7fB0Vi'),
    block.last
  )
  console.log('address', address)

  if (!address.lastTx?.lt || !address.lastTx?.hash) {
    console.log('return????')
    return
  }
  console.log('get tx', address.lastTx.lt, address.lastTx.hash)
  const txes = await liteClient.getAccountTransactions(
    Address.parse('EQCiB7Dp1BgBysXCM5Y-IJGkHbDL-ehSzRLxSsrfzk7fB0Vi'),
    address.lastTx.lt,
    address.lastTx.hash,
    100
  )
  console.log('block', block.last.seqno, txes.ids.length)
}
main()

function intToIP(int) {
  const part1 = int & 255
  const part2 = (int >> 8) & 255
  const part3 = (int >> 16) & 255
  const part4 = (int >> 24) & 255

  return `${part4}.${part3}.${part2}.${part1}`
}
