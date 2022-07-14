import { getLiteClient } from "./js/getLiteclient";

async function main() {
  const liteClient = await getLiteClient()
  // console.log('lc', liteClient)
  const block = await liteClient.getMasterchainInfo()
  console.log('block', block.last.seqno)
}
main()