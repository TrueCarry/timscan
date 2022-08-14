import axios from 'axios'
import fs from 'fs'
import { LiteClient, LiteRoundRobinEngine, LiteSingleEngine } from 'ton-lite-client'

async function main() {
  const testnetConfigUrl = 'https://ton-blockchain.github.io/testnet-global.config.json'
  const mainnetConfigUrl = 'https://ton-blockchain.github.io/global.config.json'

  const testnetConfig = await getArchiveNodesFromConfig(testnetConfigUrl)
  const mainnetConfig = await getArchiveNodesFromConfig(mainnetConfigUrl)

  const configScript = `
const testnetConfig = ${JSON.stringify(testnetConfig, null, 2)}
const mainnetConfig = ${JSON.stringify(mainnetConfig, null, 2)}
export { testnetConfig, mainnetConfig }
  `

  fs.writeFileSync('./src/networkConfig.ts', configScript)
  process.exit(0)
}

async function getArchiveNodesFromConfig(configUrl: string) {
  const { data } = await axios(configUrl)

  const goodServices = (
    await Promise.all(
      data.liteservers.map(async (ls) => {
        console.log('check', ls.ip, ls.port)
        const pubkey = encodeURIComponent(ls.id.key)
        const engines: LiteSingleEngine[] = []
        engines.push(
          new LiteSingleEngine({
            host: `tcp://${intToIP(ls.ip)}:${ls.port}`,
            // host: `ws://127.0.0.1:5999/?dest_host=${intToIP(ls.ip)}:${ls.port}`,
            publicKey: Buffer.from(ls.id.key, 'base64'),
          })
        )
        const engine = new LiteRoundRobinEngine(engines)
        const client = new LiteClient({ engine })

        try {
          console.log('do master')
          const info = await client.getMasterchainInfo()
          const blockInfo = await client.lookupBlockByID({
            seqno: info.last.seqno - 100000,
            shard: info.last.shard,
            workchain: 0,
          })
          console.log('info from', JSON.stringify(ls), ls.ip)

          return ls
        } catch (e) {
          console.log('no info from', ls.ip)
          return null
        }
      })
    )
  ).filter((v) => v)
  console.log('goood services', goodServices)

  return {
    ...data,
    litesevers: goodServices,
  }
}

main()

function intToIP(int: number) {
  const part1 = int & 255
  const part2 = (int >> 8) & 255
  const part3 = (int >> 16) & 255
  const part4 = (int >> 24) & 255

  return `${part4}.${part3}.${part2}.${part1}`
}
