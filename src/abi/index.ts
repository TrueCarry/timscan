import nftUrl from './nft?url'
import highloadWallet from './highloadWallet?url'
import wallet from './wallet?url'

export interface ContractAbi {
  methods: Record<string, MethodAbi>
}

export interface MethodAbi {
  input: unknown[]
  output: OutputArg[]
}

export interface OutputArg {
  name: string
  type: string
  length?: number
}

type importAbi = Promise<{
  default: ContractAbi
}>

export const abiMap: Record<string, string> = {
  '4c9123828682fa6f43797ab41732bca890cae01766e0674100250516e0bf8d42': nftUrl, // standard nft
  '9892766765d3ea42809a417abbd7ff9ce681b145d05ae6b118a614b38c8ded15': nftUrl, // standard nft
  feb5ff6820e2ff0d9483e7e0d62c817d846789fb4ae580c878866d959dabd5c0: wallet,
  '9494d1cc8edf12f05671a1a9ba09921096eb50811e1924ec65c3c629fbb80812': highloadWallet,
  // '9892766765d3ea42809a417abbd7ff9ce681b145d05ae6b118a614b38c8ded15': import(
  //   './nft'
  // ) as unknown as importAbi, // standard editable nft
  // feb5ff6820e2ff0d9483e7e0d62c817d846789fb4ae580c878866d959dabd5c0: import(
  //   './wallet'
  // ) as unknown as importAbi, // standard editable nft,
  // '9494d1cc8edf12f05671a1a9ba09921096eb50811e1924ec65c3c629fbb80812': import(
  //   './highloadWallet'
  // ) as unknown as importAbi, // standard editable nft,
}

// function importPath(src: string) {
//   return import(src).then((v) => v.default)
// }
