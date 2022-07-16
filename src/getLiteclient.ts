/* eslint-disable camelcase */
import axios from 'axios'
import {
  LiteClient,
  LiteEngine,
  LiteRoundRobinEngine,
  LiteSingleEngine,
} from '@/ton-lite-client/src/index'
// import { liteServer_masterchainInfo } from '../ton-lite-client/dist/schema'
// import { callTonApi } from './callTonApi'

// testnet
// const sandboxLiteClientServer = {
//   ip: -1903905862,
//   port: 33599,
//   id: {
//     '@type': 'pub.ed25519',
//     key: 'VrBrkkxiB/EDNju0FpxMavfESFvtSk1uqZeNNhMT4rs=',
//   },
// }

// sandbox
// const sandboxLiteClientServer = {
//   ip: 1426768764,
//   port: 13724,
//   id: {
//     '@type': 'pub.ed25519',
//     key: 'R1KsqYlNks2Zows+I9s4ywhilbSevs9dH1x2KF9MeSU=',
//   },
// }

function intToIP(int: number) {
  const part1 = int & 255
  const part2 = (int >> 8) & 255
  const part3 = (int >> 16) & 255
  const part4 = (int >> 24) & 255

  return `${part4}.${part3}.${part2}.${part1}`
}

let liteClient: LiteClient

// https://ton-blockchain.github.io/testnet-global.config.json
export async function getLiteClient(): Promise<LiteClient> {
  if (liteClient) {
    return liteClient
  }

  const configUrl =
    process.env.TONCONFIG_URL || 'https://ton-blockchain.github.io/global.config.json'

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
  liteClient = new LiteClient({ engine })

  return liteClient
}
// eslint-disable-next-line camelcase
let cachedMaterInfo: { info?: any; ts?: number } = {}

// eslint-disable-next-line camelcase
export async function getLastLiteBlock(lc: LiteClient): Promise<any> {
  if (cachedMaterInfo.ts && cachedMaterInfo.info && Date.now() - cachedMaterInfo.ts < 1000) {
    return cachedMaterInfo.info
  }

  const info = await lc.getMasterchainInfo()
  // await callTonApi(() => lc.getMasterchainInfo())
  cachedMaterInfo = {
    info,
    ts: Date.now(),
  }

  return info
}
