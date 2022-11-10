import { TVMExecuteConfig } from '../executor/executor'

import VmExec from './vm-exec.js'
// const VmExec: any = require('../vm-exec/vm-exec')

let instance: any = null
let isInitializing = false
const waiters: ((instance: any) => unknown)[] = []

async function getInstance() {
  if (instance) {
    return instance
  }

  if (isInitializing) {
    return new Promise<any>((resolve) => waiters.push(resolve))
  }

  isInitializing = true
  instance = await VmExec()
  // Notify all waiters
  waiters.map((w) => w(instance))
  return instance
}

export async function vm_exec(config: TVMExecuteConfig) {
  const vmInstance = await getInstance()
  const bytes = vmInstance.intArrayFromString(JSON.stringify(config))
  const ref = vmInstance.allocate(bytes, VmExec.ALLOC_NORMAL)
  const res = vmInstance._vm_exec(bytes.length - 1, ref)
  const out = vmInstance.UTF8ToString(res)
  vmInstance._free(ref)
  vmInstance._free(res)
  return JSON.parse(out)
}
