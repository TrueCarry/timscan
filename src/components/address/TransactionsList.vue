<script setup lang="ts">
import { AccountPlainState } from '@/models/AccountState'
import TxRow from './TxRow.vue'

import { computed, PropType, watch } from 'vue'
import { useAddressStore } from '@/stores/address'
import { Address } from 'ton-core'
import { address } from '@/ton/src/traits/trait_address'
import { bigIntToAddress } from '@/utils/bigIntToAddress'
// import { useStore } from 'vuex'
import InfiniteLoading from 'v3-infinite-loading'

// const store = useStore()
const addressStore = useAddressStore()

const wallet = computed(() => addressStore.wallet)

const transactions = computed(() => addressStore.transactions)
watch(transactions, () => {
  console.log('transactions update', transactions)
})

const emptyHistory = computed(() => wallet.value?.lastTx?.lt === '0')

const updateTransactions = async () => {
  const refresh =
    addressStore.transactions.length > 0 &&
    bigIntToAddress(0, addressStore.transactions[0].address).equals(
      Address.parse(wallet.value?.address || '')
    )

  if (refresh) {
    addressStore.refreshTransactions()
  } else {
    addressStore.loadTransactions({
      reset: true,
      append: false,
    })
  }
}

const loadMore = async () => {
  addressStore.loadTransactions({
    reset: false,
    append: true,
    allowMore: true,
  })
}

const hasMore = computed(() => {
  if (transactions.value.length < 1) {
    return false
  }

  const lastTx = transactions.value[transactions.value.length - 1]
  // console.log('Last tx check', lastTx, lastTx.lt.toNumber())
  if (lastTx.prevTransactionLt === 0n) {
    return false
  }

  return true
})

watch(wallet, (newWal, oldWal) => {
  if (newWal?.address !== oldWal?.address) {
    updateTransactions()
  } else {
    addressStore.refreshTransactions()
  }
})
updateTransactions()
</script>

<template>
  <div
    v-if="emptyHistory"
    class="bg-foreground shadow rounded p-4"
    v-text="$t('address.tx_table.empty')"
  />

  <div v-else class="flex flex-col bg-foreground shadow rounded p-4 w-full overflow-x-auto">
    <table class="flex-grow-0 flex-shrink-1 w-full relative box-border table-fixed min-w-[600px]">
      <thead>
        <tr>
          <th v-pre width="20" />
          <th width="140">
            <div class="tx-table__cell" v-text="$t('address.tx_table.age')" />
          </th>
          <th>
            <div class="mx-4" v-text="$t('address.tx_table.from')" />
          </th>
          <th v-pre width="60" />
          <th>
            <div class="mx-4" v-text="$t('address.tx_table.to')" />
          </th>
          <th width="180">
            <div class="text-right" style="" v-text="$t('address.tx_table.value')" />
          </th>
          <th width="180">
            <div class="text-right" style="" v-text="'Message'" />
          </th>
          <th width="80">
            <div class="text-right" style="" v-text="'Exit'" />
          </th>
        </tr>
      </thead>

      <!-- <tbody v-show="transactions.length == 0">
        <tx-row-skeleton v-for="i in 8" :key="`tx_skeleton_${i}`" />
      </tbody> -->

      <TxRow v-for="tx in transactions" :key="tx.lt.toString()" :tx="(tx as any)" />
    </table>

    <div v-if="hasMore" class="mugen-scroll">
      <div class="mugen-scroll__button" @click="loadMore">Load more</div>
    </div>

    <InfiniteLoading @infinite="loadMore" />
  </div>
</template>
