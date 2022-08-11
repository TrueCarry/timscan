<template>
  <section class="card">
    <table style="width: 100%">
      <tr>
        <td>Source</td>
        <td>
          <ui-address v-if="source" :address="source" />
          <span v-else>empty</span>
        </td>
      </tr>
      <tr>
        <td>Destination</td>
        <td>
          <ui-address v-if="destination" :address="destination" />
          <span v-else>empty</span>
        </td>
      </tr>
      <tr>
        <td>Value</td>
        <td>{{ $ton(amounts?.value?.coins.toNumber(), false) }} TON</td>
      </tr>
      <tr v-if="amounts?.fwdFee">
        <td>Forward fee</td>
        <td>{{ $ton(amounts?.fwdFee?.toNumber()) }} TON</td>
      </tr>
      <tr v-if="amounts?.ihrFee">
        <td>IHR fee</td>
        <td>{{ $ton(amounts?.ihrFee?.toNumber()) }} TON</td>
      </tr>
      <tr v-if="amounts?.importFee">
        <td>Import fee</td>
        <td>{{ $ton(amounts?.importFee?.toNumber()) }} TON</td>
      </tr>

      <template v-if="message.info.type === 'internal'">
        <tr>
          <td>Bounce</td>
          <td>{{ message.info.bounce }}</td>
        </tr>
        <tr>
          <td>Bounced</td>
          <td>{{ message.info.bounced }}</td>
        </tr>
      </template>

      <tr>
        <td>Creation LT</td>
        <td>{{ createdLt }}</td>
      </tr>
      <tr>
        <td>Created At</td>
        <td>{{ new Date(createdAt * 1000) }}</td>
      </tr>
      <tr>
        <td>Body hash</td>
        <td>{{ bodyHash }}</td>
      </tr>
    </table>
  </section>
</template>

<script setup lang="ts">
import { Transaction } from '@/models/Transaction'
import { RawMessage } from '@/ton/src'
import { computed, PropType, toRaw } from 'vue'

const props = defineProps({
  tx: {
    type: Object as PropType<Transaction>,
    required: true,
  },
  message: {
    type: Object as PropType<RawMessage>,
    required: true,
  },
})

const source = computed(() => {
  return props.message.info.src?.toFriendly({ bounceable: true, urlSafe: true })
})
const destination = computed(() => {
  return props.message.info.dest?.toFriendly({ bounceable: true, urlSafe: true })
})
const amounts = computed(() => {
  switch (props.message.info.type) {
    case 'external-in':
      return {
        importFee: props.message.info.importFee,
      }
    case 'external-out':
      return null
    case 'internal':
      return {
        value: props.message.info.value,
        ihrFee: props.message.info.ihrFee,
        fwdFee: props.message.info.fwdFee,
      }
    default:
      return null
  }
})
const createdLt = computed(() => {
  return props.message.info.type === 'external-in' ? 0 : props.message.info.createdLt
})
const createdAt = computed(() => {
  return props.message.info.type === 'external-in' ? 0 : props.message.info.createdAt
})
const bodyHash = computed(() => {
  return props.message.body && toRaw(props.message.body).hash().toString('hex')
})
</script>
