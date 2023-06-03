import { abiMap, ContractAbi } from '@/abi'
import { getAddressInfo, getTransactions } from '@/api'
import AppDb from '@/db'
import { AccountPlainState } from '@/models/AccountState'
import { SearchHistory } from '@/models/SearchHistory'
import { Transaction } from '@/models/Transaction'
import { Cell, loadTransaction } from 'ton-core'
import { callTonApi } from '@/utils/callTonApi'
import { state } from 'fp-ts'
import { defineStore } from 'pinia'
import { bigIntToBuffer } from '@/utils/bigIntToBuffer'

const db = new AppDb()

interface State {
  transactions: Array<Transaction>
  wallet: AccountPlainState | undefined
  abi: ContractAbi | undefined
  code: string
  data: string
  libs: string
  history: SearchHistory[]
}

export const useAddressStore = defineStore('address', {
  state: (): State => ({
    // count: 1,
    transactions: [],
    wallet: undefined,
    code: '',
    data: '',
    libs: '',
    abi: undefined,
    history: [],
  }),

  actions: {
    reset() {
      // this.transactions = []
      this.wallet = undefined
      this.code = ''
      this.data = ''
      this.abi = undefined
    },

    setCodeData({ code, data }) {
      this.code = code
      this.data = data

      if (code && data) {
        const codeCell = Cell.fromBoc(Buffer.from(code, 'base64'))[0]
        const hash = codeCell.hash().toString('hex')

        const abi = abiMap[hash]
        this.abi = abi
      } else {
        this.abi = undefined
      }
    },

    async loadData({
      address,
      forceUpdate,
      reset,
    }: {
      address: string
      forceUpdate?: boolean
      reset?: boolean
    }) {
      if (reset) {
        this.reset()
      }

      const walletInfo = await getAddressInfo(address, forceUpdate)
      this.wallet = walletInfo

      // if (walletInfo?.state.type === 'uninit') {
      // } else
      if (walletInfo?.state.type === 'active' && walletInfo?.address) {
        if (walletInfo.state?.code && walletInfo.state?.data) {
          this.setCodeData({
            code: walletInfo.state?.code,
            data: walletInfo.state?.data,
          })
        }

        db.history.put({ address: walletInfo.address, ts: Date.now() })
      }
    },

    async loadTransactions({
      reset,
      append,
      allowMore,
      checkForNew,
    }: { reset?: boolean; append?: boolean; allowMore?: boolean; checkForNew?: boolean } = {}) {
      if (reset) {
        this.transactions = []
      }

      let lt: string
      let hash: Buffer

      if (!append) {
        lt = this.wallet?.lastTx?.lt || ''
        hash = Buffer.from(this.wallet?.lastTx?.hash || '', 'base64')
        checkForNew = true
      } else {
        if (this.transactions.length === 0) {
          return
        }
        const lastTx = this.transactions[this.transactions.length - 1]
        lt = lastTx.prevTransactionLt.toString()
        hash = bigIntToBuffer(lastTx.prevTransactionHash)
      }

      const limit = 50
      // const lastTx = transactions.value[transactions.value.length - 1]
      const plainTxes = await callTonApi(() =>
        getTransactions(
          this.wallet?.address?.toString() || '',
          lt,
          hash,
          16,
          allowMore,
          checkForNew
        )
      )
      if (append) {
        plainTxes.shift()
      }

      const addTx = () => {
        const tx = plainTxes.shift()
        if (tx) {
          const parsed = loadTransaction(
            Cell.fromBoc(Buffer.from(tx.data, 'base64'))[0].beginParse()
          )

          this.transactions.push({ ...parsed, hash: tx.hash })
        }

        if (plainTxes.length > 0) {
          setTimeout(addTx, 1)
        }
      }
      addTx()
    },

    async refreshTransactions() {
      const lt = this.wallet?.lastTx?.lt || ''
      const hash = Buffer.from(this.wallet?.lastTx?.hash || '', 'base64')

      // const limit = 50
      const plainTxes = await callTonApi(() =>
        getTransactions(this.wallet?.address?.toString() || '', lt, hash, 16, false, false)
      )

      if (this.transactions && this.transactions.length > 0) {
        const startTx = this.transactions[0].lt.toString()
        const newTx = plainTxes[0].lt

        if (startTx !== newTx) {
          for (const tx of plainTxes.reverse()) {
            if (this.transactions.find((sttx) => sttx.lt.toString() === tx.lt)) {
              continue
            }

            const parsed = loadTransaction(Cell.fromBase64(tx.data).asSlice())

            this.transactions.unshift({ ...parsed, hash: tx.hash })
          }
        }
      }
    },

    async loadHistory() {
      const items = await db.history.orderBy('ts').reverse().limit(10).toArray()
      this.history = items
    },
  },
})
