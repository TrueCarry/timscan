import { nftAbi } from './nft'
import { walletAbi } from './wallet'
import { highloadWalletAbi } from './highloadWallet'
// import { NormalizedStackEntry, TVMStackEntry } from '@/ton-contract-executor/src'
import { nftCollectionAbi } from './nftCollectionEditable'
import { nftSaleAbi } from './nftSale'
import { nftEditableAbi } from './nftEditable'
import { dnsCollectionAbi } from './dnsCollection'
import { dnsItemAbi } from './dnsItem'
import { getgemsAuctionAbi } from './getgemsAuction'
import { getgemsAuctionV2Abi } from './getgemsAuctionV2'
import { telemintNftAbi } from './nftTelemint'
import { getgemsSaleV2 } from './getgemsSaleV2'
import { getgemsOffer } from './getgemsOffer'
import { TupleItem } from 'ton-core'

export interface ContractAbi {
  name?: string
  methods: Record<string, MethodAbi>
}

export interface MethodAbi {
  input: InputArg[]
  output: OutputArg[]
}

export interface InputArg {
  name: string
  type: TupleItem['type']
  content?: CellContent[]
}

export interface OutputArg {
  name: string
  type: TupleItem['type'] | string
  content?: CellContent[]
}

export interface CellContent {
  name: string
  type: string
  length?: number
  content?: CellContent[]
}

export interface OutputResult extends OutputArg {
  value: TupleItem
}

export const abiMap: Record<string, ContractAbi> = {
  '4c9123828682fa6f43797ab41732bca890cae01766e0674100250516e0bf8d42': nftAbi, // standard nft
  '9892766765d3ea42809a417abbd7ff9ce681b145d05ae6b118a614b38c8ded15': nftEditableAbi, // standard nft
  '11200487503ff94c8e08703e7ea20926eb19e4f050d2b332dbbcb0642cfc07fa': nftAbi, // slightly updated standard nft?
  cbd593e6a1abfd6ef1acdaff554ff47cbba4999e48a5dd9f352a0aef1af54326: nftEditableAbi, // g bots nft

  feb5ff6820e2ff0d9483e7e0d62c817d846789fb4ae580c878866d959dabd5c0: walletAbi,
  '84dafa449f98a6987789ba232358072bc0f76dc4524002a5d0918b9a75d2d599': walletAbi,
  cbd73dced5b4e113234e5b3da1b933f6aad9205b5b8250964bee7a261507de6a: walletAbi, // getgems marketplace
  '9494d1cc8edf12f05671a1a9ba09921096eb50811e1924ec65c3c629fbb80812': highloadWalletAbi,
  '64bb2d4661b5f2dc1a83bf5cbbe09e92ac0b460a1b879a5519386fca4c348bca': nftCollectionAbi,
  ece528db075258917931e5c0d725fcedf9a0e349ba546244e609059813564a1a: nftCollectionAbi, // g-bots
  '5de43c9ca08a0d7e5e21b998508150a8062dfc6b21e10efe8eb68838ee9eaf68': nftSaleAbi,
  eec5bbc25065628799468860d8fd48031585f649c32fa382c888ba48831625a3: dnsCollectionAbi, // dns collection
  '8b5ffc9ebfd39064d8d5f56e4659c826bb7593923f5ca48728be4d60af6f51f9': dnsItemAbi,
  fc00a29dd0205bcdcc0d3ffb9ca38cc3c8c159ec60d8aa543240a92f10592d40: getgemsAuctionAbi,
  '6668872fa79705443ffd47523e8e9ea9f76ab99f9a0b59d27de8f81a1c27b9d4': getgemsAuctionV2Abi, // getgems auction v2

  a7a2616a4d639a076c2f67e7cce0423fd2a1c2ee550ad651c1eda16ee13bcaca: telemintNftAbi,
  '8278f4c5233de6fbedc969af519344a7a9bffc544856dba986a95c0bcf8571c9': getgemsSaleV2,

  '7aa13161df5469acb9daab5ad3b9cb14a2c9754395e6355ccdb8dded6482092b': getgemsOffer, // offer
}
