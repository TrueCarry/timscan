<script setup lang="ts">
import { RawMessage } from '@/ton/src'
import { Transaction } from '@/models/Transaction'
import BN from 'bn.js'
import { computed, PropType, ref } from 'vue'
import MessageRowDetails from './MessageRowDetails.vue'

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
  <tr v-if="!isExternal">
    <td>
      <router-link class="tx-table-cell-icon" :to="routerUrl">
        <svg v-pre xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
          <path
            d="M7.665 9.301c-.155-.067-.338-.206-.549-.417a2.6 2.6 0 0 1 0-3.677l1.768-1.768a2.6 2.6 0 0 1 3.677 3.677l-1.167 1.167m-3.06-1.584c.156.067.339.206.55.417a2.6 2.6 0 0 1 0 3.677l-1.768 1.768A2.6 2.6 0 1 1 3.44 8.884l1.167-1.167"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-width="1.3"
          />
        </svg>
      </router-link>
    </td>
    <td>
      <div class="tx-table__cell">
        <ui-timeago :timestamp="tx.time * 1000" />
      </div>
    </td>
    <td>
      <div class="tx-table__cell tx-table__cell--align-right">
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
        <span v-if="isExternal" class="tx-table__badge tx-table__badge--service">OUT</span>
        <span v-else-if="isOut" class="tx-table__badge tx-table__badge--out">OUT</span>
        <span v-else class="tx-table__badge tx-table__badge--in">IN</span>
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
        class="tx-table__cell tx-table__cell--align-right"
        style="position: relative; padding-right: 26px"
      >
        {{ $ton(amount.toNumber()) }} TON

        <!-- <svg v-if="message" style="position: absolute; right: 1px;" width="14" height="14" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path d="M0 0h14v14H0z"/><path d="M3.375 1.35h7.3a2 2 0 0 1 2 2v5.3a2 2 0 0 1-2 2H7.6l-2.77 2.424a.5.5 0 0 1-.83-.376V10.65h-.625a2 2 0 0 1-2-2v-5.3a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></g></svg> -->
      </div>
    </td>
    <td>
      <div class="tx-table__cell" @click="isVisible = !isVisible">
        <svg
          class="tx-table-expand-caret"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          :class="{ 'tx-table-expand-caret--expanded': isVisible }"
        >
          <path
            stroke="currentColor"
            stroke-width="1.3"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m1.5 4.75 5.5 5.5 5.5-5.5"
          />
        </svg>
      </div>
    </td>
  </tr>
  <MessageRowDetails v-if="isVisible" :is-visible="isVisible" :tx="tx" :message="message" />
</template>
