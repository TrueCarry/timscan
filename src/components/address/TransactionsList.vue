<script setup lang="ts">
import { AccountPlainState } from '@/models/AccountState'
import TxRow from './TxRow.vue'

import { computed, PropType, watch } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const wallet = computed(() => store.state.address.wallet)

const transactions = computed(() => store.state.address.transactions)
watch(transactions, () => {
  console.log('transactions update', transactions)
})

const emptyHistory = computed(() => wallet.value.lastTx?.lt === '0')

const updateTransactions = async () => {
  console.log('transactions update')
  store.dispatch('address/loadTransactions', {
    reset: true,
    append: false,
  })
}

const loadMore = async () => {
  store.dispatch('address/loadTransactions', {
    reset: false,
    append: true,
    allowMore: true,
  })
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

watch(wallet, (newWal, oldWal) => {
  if (newWal.address !== oldWal.address) {
    updateTransactions()
  } else {
    store.dispatch('address/refreshTransactions')
  }
})
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

      <TxRow v-for="tx in transactions" :key="tx.lt.toString()" :tx="tx" />
    </table>

    <div v-if="hasMore" class="mugen-scroll">
      <div class="mugen-scroll__button" @click="loadMore">Load more</div>
    </div>
  </div>
</template>
