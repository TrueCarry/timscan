import { Address, Cell, Slice } from '@/ton/src'
import { crc16 } from '../utils/crc16'
// eslint-disable-next-line camelcase
import { vm_exec } from '../vm-exec/vmExec'
// import {randomBytes} from "crypto";
// import randomBytes from 'randombytes'
import BN from 'bn.js'
import { TvmRunner } from './TvmRunner'
import { cellToBoc } from '../utils/cell'
import nacl from 'tweetnacl'

export type TVMExecuteConfig = {
  debug: boolean
  function_selector: number
  init_stack: TVMStack
  code: string // base64 encoded TVM fift assembly
  data: string // base64 encoded boc(data_cell)
  c7_register: TVMStackEntryTuple
}

export type TVMStack = TVMStackEntry[]

export type TVMExecutionResultOk = {
  ok: true
  exit_code: number // TVM Exit code
  gas_consumed: number
  stack: TVMStack // TVM Resulting stack
  data_cell: string // base64 encoded BOC
  action_list_cell: string // base64 encoded BOC
  logs: string
}

export type TVMExecutionResultFail = {
  ok: false
  error?: string
  exit_code?: number
  logs?: string
}

export type TVMExecutionResult = TVMExecutionResultOk | TVMExecutionResultFail

export type TVMStackEntry =
  | TVMStackEntryNull
  | TVMStackEntryCell
  | TVMStackEntryInt
  | TVMStackEntryCellSlice
  | TVMStackEntryTuple

export type TVMStackEntryNull = { type: 'null' }
export type TVMStackEntryCell = { type: 'cell'; value: string }
export type TVMStackEntryInt = { type: 'int'; value: string }
export type TVMStackEntryCellSlice = { type: 'cell_slice'; value: string }
export type TVMStackEntryTuple = { type: 'tuple'; value: TVMStackEntry[] }

const makeIntEntry = (value: number | BN): TVMStackEntryInt => ({
  type: 'int',
  value: value.toString(10),
})
const makeTuple = (items: TVMStackEntry[]): TVMStackEntryTuple => ({ type: 'tuple', value: items })
const makeNull = (): TVMStackEntryNull => ({ type: 'null' })
const makeCell = (cell: Cell): TVMStackEntryCell => ({ type: 'cell', value: cellToBoc(cell) })
const makeSlice = (cell: Cell): TVMStackEntryCellSlice => ({
  type: 'cell_slice',
  value: cellToBoc(cell),
})

export type C7Config = {
  unixtime?: number
  balance?: BN
  myself?: Address
  randSeed?: BN
  actions?: number
  messagesSent?: number
  blockLt?: number
  transLt?: number
  globalConfig?: Cell
}

export function buildC7(config: C7Config) {
  const now = Math.floor(Date.now() / 1000)

  const seed = nacl.randomBytes(32)

  const seedInt = new BN(seed)

  const currentConfig: Required<C7Config> = {
    unixtime: now,
    balance: new BN(1000),
    myself: new Address(0, Buffer.alloc(256 / 8)),
    randSeed: seedInt,
    actions: 0,
    messagesSent: 0,
    blockLt: now,
    transLt: now,
    globalConfig: new Cell(),
    ...config,
  }

  // addr_std$10 anycast:(Maybe Anycast)
  //    workchain_id:int8 address:bits256  = MsgAddressInt;
  // workchain_id:int8 address:bits256  = MsgAddressInt;
  const addressCell = new Cell()
  addressCell.bits.writeAddress(currentConfig.myself)

  // [Integer (Maybe Cell)]
  const balance = makeTuple([makeIntEntry(currentConfig.balance), makeNull()])

  return makeTuple([
    makeTuple([
      makeIntEntry(0x076ef1ea), // [ magic:0x076ef1ea
      makeIntEntry(currentConfig.actions), // actions:Integer
      makeIntEntry(currentConfig.messagesSent), // msgs_sent:Integer
      makeIntEntry(currentConfig.unixtime), // unixtime:Integer
      makeIntEntry(currentConfig.blockLt), // block_lt:Integer
      makeIntEntry(currentConfig.transLt), // trans_lt:Integer
      makeIntEntry(currentConfig.randSeed), // rand_seed:Integer
      balance, // balance_remaining:[Integer (Maybe Cell)]
      makeSlice(addressCell), // myself:MsgAddressInt
      makeCell(currentConfig.globalConfig), // global_config:(Maybe Cell) ] = SmartContractInfo;
    ]),
  ])
}

export async function runTVM(config: TVMExecuteConfig): Promise<TVMExecutionResult> {
  return await vm_exec(config)
}

export type RunContractConfig = {
  code: Cell
  dataCell: Cell
  stack: TVMStack
  method: string
  c7: TVMStackEntryTuple
  debug: boolean
  executor?: TvmRunner
}

export async function runContract(config: RunContractConfig): Promise<TVMExecutionResult> {
  const { code, dataCell, stack, method, c7, debug, executor } = config

  const executorConfig = {
    debug,
    function_selector: getSelectorForMethod(method),
    init_stack: stack,
    code: cellToBoc(code),
    data: cellToBoc(dataCell),
    c7_register: c7,
  }

  let res
  if (!executor) {
    res = await runTVM(executorConfig)
  } else {
    res = await executor.invoke(executorConfig)
  }

  return res
}

export function getSelectorForMethod(methodName: string) {
  if (methodName === 'main') {
    return 0
  } else if (methodName === 'recv_internal') {
    return 0
  } else if (methodName === 'recv_external') {
    return -1
  } else {
    return (crc16(methodName) & 0xffff) | 0x10000
  }
}
