<script setup lang="ts">
import { RawMessage } from '@/ton/src'
import { Transaction } from '@/models/Transaction'
import BN from 'bn.js'
import { computed, PropType, ref } from 'vue'
import MessageRowDetails from './MessageRowDetails.vue'
import IconCaret from '@/assets/images/icon-caret.svg'
import IconLink from '@/assets/images/icon-link.svg'

type SourceFrom = 'in' | 'out'

const props = defineProps({
  tx: {
    type: Object as PropType<Transaction>,
    required: true,
    // default: () => undefined
  },
  message: {
    type: Object as PropType<RawMessage>,
    required: true,
  },
  source: {
    type: String as PropType<SourceFrom>,
    required: true,
  },
})

const sourceAddress = computed(() => {
  return props.tx.inMessage?.info.src || props.tx.outMessages[0]?.info.src
})

const isOut = computed(() => {
  return props.source === 'out'
  //  props.address && sourceAddress.value && props.address.equals(sourceAddress.value)
})

const from = computed(() => {
  return props.message.info.src
})
const to = computed(() => {
  return props.message.info.dest
})

const isExternal = computed(() => {
  return props.message.info.type === 'external-in' || props.message.info.type === 'external-out'
})

const amount = computed(() => {
  if (props.message.info.type === 'internal') {
    return props.message.info.value.coins
  }
  return new BN(0)
})

const routerUrl = computed(() => {
  return `/tx/${props.tx.lt.toString()}:${fromBase64(
    Buffer.from(props.tx.hash, 'hex').toString('base64')
  )}:${props.tx.address.toFriendly({ urlSafe: true, bounceable: true })}`
})

function fromBase64(base64: string): string {
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

const isVisible = ref(false)
</script>

<template>
  <tr class="h-12">
    <td>
      <router-link class="tx-table-cell-icon" :to="routerUrl">
        <IconLink class="w-4 h-4" />
      </router-link>
    </td>
    <td>
      <div class="tx-table__cell">
        <ui-timeago :timestamp="tx.time * 1000" />
      </div>
    </td>
    <td>
      <div v-if="!isExternal" class="tx-table__cell tx-table__cell--align-right">
        <span v-if="!from">hidden</span>
        <ui-address
          v-else
          :address="from.toFriendly({ urlSafe: true, bounceable: true })"
          :disabled="isOut"
        />
      </div>
    </td>
    <td>
      <div class="tx-table__cell" style="padding: 0">
        <span
          v-if="isOut"
          class="tx-table__badge tx-table__badge--out"
          :class="isExternal && 'tx-table__badge--service'"
          >OUT</span
        >
        <span
          v-else
          class="tx-table__badge tx-table__badge--in"
          :class="isExternal && 'tx-table__badge--service'"
          >IN</span
        >
      </div>
    </td>
    <td>
      <div v-if="to" class="tx-table__cell">
        <ui-address
          :address="to.toFriendly({ urlSafe: true, bounceable: true })"
          :disabled="!isOut"
        />
      </div>
    </td>
    <td>
      <div
        v-if="amount"
        class="tx-table__cell tx-table__cell--align-right"
        style="position: relative; padding-right: 26px"
      >
        {{ $ton(amount.toNumber()) }} TON

        <!-- <svg v-if="message" style="position: absolute; right: 1px;" width="14" height="14" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path d="M0 0h14v14H0z"/><path d="M3.375 1.35h7.3a2 2 0 0 1 2 2v5.3a2 2 0 0 1-2 2H7.6l-2.77 2.424a.5.5 0 0 1-.83-.376V10.65h-.625a2 2 0 0 1-2-2v-5.3a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></g></svg> -->
      </div>
    </td>
    <td>
      <div
        class="flex items-center justify-center w-4 h-4 origin-center"
        :class="{ 'rotate-180': isVisible }"
        @click="isVisible = !isVisible"
      >
        <IconCaret class="h-[12px] w-[13px] m-0" />
      </div>
    </td>
  </tr>
  <MessageRowDetails v-if="isVisible" :is-visible="isVisible" :tx="tx" :message="message" />
</template>
