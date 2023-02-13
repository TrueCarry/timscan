<template>
  <section>
    <section v-if="isError">
      <div class="alert" v-text="$t('error.invalid_tx')" />
    </section>

    <div v-else-if="tx" class="mx-4 my-4 gap-4 flex flex-col lg:container lg:mx-auto lg:flex-row">
      <div class="w-full lg:w-1/2 space-y-4">
        <TxInfo :tx="tx" :address="address" :lt="lt" :hash="txHash" />
        <TxPhaseInfo :tx="tx" />
      </div>

      <div class="w-full lg:w-1/2 space-y-4">
        <TxMsg
          v-if="tx.inMessage"
          class="tx-page-msg-details"
          :tx="tx"
          :message="tx.inMessage"
          :direction="'in'"
        />

        <div
          v-for="(msg, i) in tx?.outMessages.values()"
          :key="`${props.lt}:${i}`"
          class="tx-page-msg"
        >
          <TxMsg class="tx-page-msg-details" :tx="tx" :message="msg" :direction="'out'" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { getTransaction } from '@/api'
import { Transaction } from '@/models/Transaction'
import { Cell, loadTransaction } from 'ton-core'
import { computed, ref, watch } from 'vue'
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
    hash: Buffer.from(props.hash, 'base64'),
    lt: props.lt,
  }).catch((e) => {
    isError.value = true
    return null
  })
  console.log('got tx', apiTx)
  if (apiTx) {
    const cellData = Cell.fromBoc(Buffer.from(apiTx.data, 'base64'))[0]
    const data = loadTransaction(Cell.fromBoc(Buffer.from(apiTx.data, 'base64'))[0].beginParse())
    tx.value = { ...data, hash: apiTx.hash }
    console.log('cell hash', cellData.hash().toString('base64'))
  } else {
    isError.value = true
  }
}

const txHash = computed(() => {
  return Buffer.from(tx?.value?.hash || '', 'hex').toString('base64')
})

watch([props], () => {
  console.log('page tx watch')
  loadData()
})
loadData()
</script>
