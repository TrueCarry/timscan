<template>
  <section>
    <section v-if="isError">
      <div class="alert" v-text="$t('error.invalid_tx')" />
    </section>

    <div v-else-if="tx" class="card">
      <TxInfo :tx="tx" :address="address" :lt="lt" :hash="hash" />

      <div class="tx-page-messages">
        <div v-if="tx?.inMessage" class="tx-page-msg">
          <div class="card-row__name">
            <span class="tx-table__badge tx-table__badge--in">IN</span>
          </div>
          <!-- {{ tx.inMessage }} -->
          <TxMsg class="tx-page-msg-details" :tx="tx" :message="tx.inMessage" />
        </div>

        <div v-for="(msg, i) in tx?.outMessages" :key="i" class="tx-page-msg">
          <div class="card-row__name">
            <span class="tx-table__badge tx-table__badge--out">OUT</span>
          </div>
          <TxMsg class="tx-page-msg-details" :tx="tx" :message="msg" />
        </div>
      </div>

      <TxPhaseInfo :tx="tx" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { getTransaction } from '@/api'
import { Transaction } from '@/models/Transaction'
import { Cell, parseTransaction } from '@/ton/src'
import { ref } from 'vue'
import TxMsg from './TxMsg.vue'
import TxInfo from './TxInfo.vue'
import TxPhaseInfo from './TxPhaseInfo.vue'
// import { getTransaction } from '~/api'
// import TxMsg from './TxMsg.vue'

const props = defineProps({
  lt: {
    type: String,
    required: true,
  },
  hash: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
})

const tx = ref<Transaction>()
const isError = ref<boolean>(false)

async function loadData() {
  // this.isLoading = true
  //   this.isError = false

  const apiTx = await getTransaction({
    address: props.address,
    hash: props.hash,
    lt: props.lt,
  }).catch((e) => {
    isError.value = true
    return null
  })
  console.log('got tx', apiTx)
  if (apiTx) {
    const data = parseTransaction(
      0,
      Cell.fromBoc(Buffer.from(apiTx.data, 'base64'))[0].beginParse()
    )
    tx.value = { ...data, hash: apiTx.hash }
  } else {
    isError.value = true
  }
}

loadData()
</script>
