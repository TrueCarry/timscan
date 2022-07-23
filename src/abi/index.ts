import { nftAbi } from './nft'
import { walletAbi } from './wallet'
import { highloadWalletAbi } from './highloadWallet'
import { NormalizedStackEntry } from '@/ton-contract-executor/src'

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

export interface OutputResult extends OutputArg {
  value: NormalizedStackEntry
}

export const abiMap: Record<string, ContractAbi> = {
  '4c9123828682fa6f43797ab41732bca890cae01766e0674100250516e0bf8d42': nftAbi, // standard nft
  '9892766765d3ea42809a417abbd7ff9ce681b145d05ae6b118a614b38c8ded15': nftAbi, // standard nft
  feb5ff6820e2ff0d9483e7e0d62c817d846789fb4ae580c878866d959dabd5c0: walletAbi,
  '9494d1cc8edf12f05671a1a9ba09921096eb50811e1924ec65c3c629fbb80812': highloadWalletAbi,
}
