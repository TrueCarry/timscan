<template>
  <section>
    <section v-if="isError">
      <div class="alert" v-text="$t('error.invalid_tx')" />
    </section>

    <div v-else-if="tx" class="card">
      <div class="card-row">
        <div class="card-row__name" v-text="$t('tx.address')" />
        <div class="card-row__value">
          <ui-copy-button
            show-button
            :copy="address"
            :success-message="$t('address.info.copy_success')"
          >
            {{ tx?.address.toFriendly({ urlSafe: true, bounceable: true }) }}
          </ui-copy-button>
        </div>
      </div>

      <div class="card-row">
        <div class="card-row__name" v-text="$t('tx.lt')" />
        <div class="card-row__value">
          <ui-copy-button show-button :copy="lt" :success-message="$t('tx.lt_copy_success')">
            {{ tx?.lt.toNumber() }}
          </ui-copy-button>
        </div>
      </div>

      <div class="card-row">
        <div class="card-row__name" v-text="$t('tx.hash')" />
        <div class="card-row__value">
          <ui-copy-button show-button :copy="hash" :success-message="$t('tx.hash_copy_success')">
            {{ hash }}
          </ui-copy-button>
        </div>
      </div>

      <div class="card-row">
        <div class="card-row__name" v-text="$t('tx.timestamp')" />
        <div class="card-row__value">
          <span v-if="tx" v-text="new Date(tx.time * 1000)" />
          <span v-else class="skeleton">00/00/2000 10:00</span>
        </div>
      </div>

      <div class="card-row">
        <div class="card-row__name" v-text="$t('tx.fee')" />
        <div class="card-row__value">
          <!-- <span v-if="isLoading" class="skeleton">000000 TON</span> -->
          <span>{{ $ton(tx?.fees.coins.toNumber() || 0) }} TON</span>
        </div>
      </div>

      <div class="card-row" style="border-bottom: none">
        <div class="card-row__name" v-text="$t('tx.msgs')" />
        <div class="card-row__value">
          <!-- <span v-if="isLoading" class="skeleton">1 input, 1 output</span> -->
          <span v-if="!tx?.inMessage && !tx?.outMessagesCount" v-text="$t('tx.msgs_empty')" />
          <span v-else v-text="$t('tx.msgs_count', [1, tx?.outMessagesCount])" />
        </div>
      </div>

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
    </div>

    <div class="card">{{ tx }}</div>
  </section>
</template>

<script setup lang="ts">
import { getTransaction } from '@/api'
import { Transaction } from '@/models/Transaction'
import { Cell, parseTransaction } from '@/ton/src'
import { ref } from 'vue'
import TxMsg from './TxMsg.vue'
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
