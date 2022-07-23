<script setup lang="ts">
import { Transaction } from '@/models/Transaction'
import { PropType } from 'vue'

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
  tx: {
    type: Object as PropType<Transaction>,
    required: true,
  },
})
</script>

<template>
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
</template>
