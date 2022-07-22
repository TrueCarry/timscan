<script setup lang="ts">
import { RawTransaction, RawMessage } from '@/ton/src'
import { computed, PropType, toRaw } from 'vue'

type TxType = RawTransaction & { hash: string }

const props = defineProps({
  tx: {
    type: Object as PropType<TxType>,
    required: true,
    // default: () => undefined
  },
  message: {
    type: Object as PropType<RawMessage>,
    required: true,
  },
  isVisible: {
    type: Boolean,
    required: true,
  },
})

const dateTime = computed(() => new Date(props.tx.time * 1000))
const text = computed(() => {
  if (props.message) {
    const raw = toRaw(props.message)
    const slice = raw.body.beginParse()
    if (slice.remaining < 32) {
      return null
    }

    const uint = slice.readUint(32).toNumber()

    if (uint === 0 && slice.remaining > 0) {
      return new TextDecoder().decode(slice.readRemainingBytes())
    }
  }

  return null
})
console.log('text', text)

// const bytes = props.message.body.beginParse().readRemainingBytes()
// console.log('bytes', bytes)
// const text = computed(() =>
//   new TextDecoder().decode(props.message.body.beginParse().readRemainingBytes())
// )
//  props.message.body.beginParse().readRemainingBytes())
// const txHash = computed(() => props.tx.)
</script>

<template>
  <tr class="tx-table-row-details">
    <td colspan="10">
      <div class="tx-table-inner-container">
        <div class="tx-table-inner">
          <div class="tx-table-inner__header" v-text="$t('tx.timestamp')" />
          {{ dateTime.toLocaleString() }}
        </div>

        <div class="tx-table-inner">
          <div class="tx-table-inner__header" v-text="$t('tx.hash')" />

          <ui-copy-button
            show-button
            :copy="props.tx.hash"
            :success-message="$t('tx.hash_copy_success')"
          >
            {{ props.tx.hash }}
          </ui-copy-button>
        </div>

        <div class="tx-table-inner">
          <div class="tx-table-inner__header" v-text="$t('tx.lt')" />

          <ui-copy-button
            show-button
            :copy="props.tx.lt.toString()"
            :success-message="$t('tx.lt_copy_success')"
          >
            {{ props.tx.lt.toString() }}
          </ui-copy-button>
        </div>

        <div class="tx-table-inner">
          <div class="tx-table-inner__header" v-text="$t('tx.fee')" />
          {{ $ton(props.tx.fees.coins.toNumber()) }} TON
        </div>

        <div v-if="text" class="tx-table-inner">
          <div class="tx-table-inner__header" v-text="$t('tx.message')" />
          {{ text }}
        </div>
      </div>
    </td>
  </tr>
</template>
