<script setup lang="ts">
import { Transaction } from '@/models/Transaction'
import { Address } from 'ton-core'
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

const exitCode = computed(() => {
  if (props.tx.description.type !== 'generic') {
    return undefined
  }
  // if (props.message.info.type !== 'internal') {
  //   return undefined
  // }

  // props.message.

  if (props.tx.description.computePhase.type === 'skipped') {
    return undefined
  }
  return props.tx.description.computePhase.exitCode
})
</script>

<template>
  <template v-if="tx.outMessagesCount < 10">
    <template v-for="(message, i) in tx.outMessages.values()" :key="i">
      <MessageRow
        :tx="tx"
        :message="message"
        :source="'out'"
        :class="i === -1 && 'border-b border-navy-600'"
      />
    </template>
  </template>
  <MultiOutputRow v-else :tx="tx" />

  <template v-if="tx.inMessage">
    <MessageRow
      :tx="tx"
      :message="tx.inMessage"
      :source="'in'"
      :class="'border-b border-navy-600'"
      :exit-code="exitCode"
    />
  </template>
</template>
