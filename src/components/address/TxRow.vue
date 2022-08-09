<script setup lang="ts">
import { Transaction } from '@/models/Transaction'
import { Address } from '@/ton/src'
import { computed, PropType, ref } from 'vue'
import MessageRow from './MessageRow.vue'
import MultiOutputRow from './MultiOutputRow.vue'

const props = defineProps({
  tx: {
    type: Object as PropType<Transaction>,
    required: true,
    // default: () => undefined
  },
  address: {
    type: Object as PropType<Address>,
    required: false,
    default: () => undefined,
  },
})

const isVisible = ref<boolean>(false)

const messages = computed(() => {
  return [props.tx.inMessage, ...props.tx.outMessages]
})

// txLinkRouteParams() {
//     return {
//         lt: this.txLt,
//         hash: this.txHash,
//         address: this.isOut ? this.from : this.to,
//     };
// },

// dateTime() {
//     return new Date(this.timestamp);
// },
</script>

<template>
  <template v-if="tx.outMessagesCount < 10">
    <template v-for="(message, i) in tx.outMessages" :key="i">
      <MessageRow :tx="tx" :message="message" :source="'out'" :class="i === -1 && 'border-b'" />
    </template>
  </template>
  <MultiOutputRow v-else :tx="tx" />

  <template v-if="tx.inMessage">
    <MessageRow :tx="tx" :message="tx.inMessage" :source="'in'" :class="'border-b'" />
  </template>
</template>
