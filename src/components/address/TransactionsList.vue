<script setup lang="ts">
import { getTransactions } from '@/api'
import { AccountPlainState } from '@/models/AccountState'
import { LiteClient } from '@/ton-lite-client/src'
import { Cell, parseTransaction, RawTransaction } from '@/ton/src'
import TxRow from './TxRow.vue'

import { computed, inject, PropType, ref, watch } from 'vue'

const $lc = inject('$lc') as LiteClient

const props = defineProps({
  wallet: {
    type: Object as PropType<AccountPlainState>,
    required: true,
  },
})

const transactions = ref<RawTransaction[]>([])

const emptyHistory = computed(() => props.wallet.lastTx?.lt === '0')

const updateTransactions = async () => {
  if (emptyHistory.value || !props.wallet.address || !props.wallet.lastTx) {
    return
  }

  const plainTxes = await getTransactions(
    $lc,
    props.wallet.address?.toString(),
    props.wallet.lastTx.lt || '',
    Buffer.from(props.wallet.lastTx.hash, 'base64'),

    16
  )
  transactions.value = plainTxes.map((pt) =>
    parseTransaction(0, Cell.fromBoc(Buffer.from(pt.data, 'base64'))[0].beginParse())
  )
}

function delay(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

// Function to call ton api untill we get response.
// Because testnet is pretty unstable we need to make sure response is final
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function callTonApi<T extends (...args: any[]) => any>(
  toCall: T,
  attempts = 20,
  delayMs = 100
): Promise<ReturnType<T>> {
  if (typeof toCall !== 'function') {
    throw new Error('unknown input')
  }

  let i = 0
  let lastError: unknown

  while (i < attempts) {
    try {
      const res = await toCall()
      return res
    } catch (err) {
      lastError = err
      i++
      await delay(delayMs)
    }
  }

  console.log('error after attempts', i)
  throw lastError
}

const loadMore = async () => {
  console.log('loadMore')
  // this.isLoading = true

  const limit = 50
  const lastTx = transactions.value[transactions.value.length - 1]
  // const {
  //   prevTransaction: { lt, hash },
  // } = lastTx

  // const t1 = window.performance.now()
  const plainTxes = await callTonApi(() =>
    getTransactions(
      $lc,
      props.wallet.address!.toString(),
      lastTx.prevTransaction.lt.toString(),
      lastTx.prevTransaction.hash,
      16,
      true
    )
  )
  // const t2 = window.performance.now()
  plainTxes.shift()
  // const newTx = plainTxes.map((pt) =>
  //   )
  // )
  const addTx = () => {
    const tx = plainTxes.shift()
    if (tx) {
      const parsed = parseTransaction(
        0,
        Cell.fromBoc(Buffer.from(tx.data, 'base64'))[0].beginParse()
      )
      transactions.value.push(parsed)
    }

    if (plainTxes.length > 0) {
      setTimeout(addTx, 1)
    }
  }
  addTx()
  // const t3 = window.performance.now()
  // console.log('time spent', t2 - t1, t3 - t2)

  // this.hasMore = newTx.length >= limit
  // this.isLoading = false

  // First tx from the new batch is the last tx from the old batch:

  // transactions.value = transactions.value.concat(newTx)
}

const hasMore = computed(() => {
  if (transactions.value.length < 1) {
    return false
  }

  const lastTx = transactions.value[transactions.value.length - 1].prevTransaction
  // console.log('Last tx check', lastTx, lastTx.lt.toNumber())
  if (lastTx.lt.toNumber() === 0) {
    return false
  }

  return true
})

watch([emptyHistory, props.wallet], updateTransactions)
updateTransactions()
</script>

<template>
  <div v-if="emptyHistory" class="tx-history-empty-panel" v-text="$t('address.tx_table.empty')" />

  <div v-else class="tx-history-wrap">
    <table class="tx-table">
      <thead>
        <tr>
          <th v-pre width="40" />
          <th width="100">
            <div class="tx-table__cell" v-text="$t('address.tx_table.age')" />
          </th>
          <th>
            <div
              class="tx-table__cell tx-table__cell--align-right"
              v-text="$t('address.tx_table.from')"
            />
          </th>
          <th v-pre width="50" />
          <th>
            <div class="tx-table__cell" v-text="$t('address.tx_table.to')" />
          </th>
          <th>
            <div
              class="tx-table__cell tx-table__cell--align-right"
              style="padding-right: 26px"
              v-text="$t('address.tx_table.value')"
            />
          </th>
          <th v-pre width="40">
            <div class="tx-table__cell" />
          </th>
        </tr>
      </thead>

      <!-- <tbody v-show="transactions.length == 0">
        <tx-row-skeleton v-for="i in 8" :key="`tx_skeleton_${i}`" />
      </tbody> -->

      <TxRow v-for="tx in transactions" :key="tx.lt.toString()" :tx="(tx as RawTransaction)" />
    </table>

    <div v-if="hasMore" class="mugen-scroll">
      <div class="mugen-scroll__button" @click="loadMore">Load more</div>
    </div>
  </div>
</template>
