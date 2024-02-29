<script setup lang="ts">
import { Transaction } from '@/models/Transaction'

import BN from 'bn.js'
import { computed, PropType, ref } from 'vue'
import IconToncoin from '@/assets/images/icon-toncoin.svg?component'

type SourceFrom = 'in' | 'out'

const props = defineProps({
  tx: {
    type: Object as PropType<Transaction>,
    required: true,
    // default: () => undefined
  },
})

const sourceAddress = computed(() => {
  return props.tx.inMessage?.info.src || props.tx.outMessages[0]?.info.src
})

const isOut = computed(() => {
  return true
})

// const to = computed(() => {
//   return props.tx.outMessages[0].info.src // props.message.info.dest
// })

// const isExternal = computed(() => {
//   return props.message.info.type === 'external-in' || props.message.info.type === 'external-out'
// })

const amount = computed(() => {
  // if (props.message.info.type === 'internal') {
  //   return props.message.info.value.coins
  // }
  let total = 0n
  for (const [, out] of props.tx.outMessages) {
    console.log('check out')
    if (out.info.type === 'internal') {
      total += out.info.value.coins
    }
  }
  console.log('total', total.toString())
  return total
})

const isVisible = ref(true)
</script>

<template>
  <tbody>
    <tr>
      <td>
        <a class="tx-table-cell-icon">
          <svg v-pre xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
            <path
              d="M7.665 9.301c-.155-.067-.338-.206-.549-.417a2.6 2.6 0 0 1 0-3.677l1.768-1.768a2.6 2.6 0 0 1 3.677 3.677l-1.167 1.167m-3.06-1.584c.156.067.339.206.55.417a2.6 2.6 0 0 1 0 3.677l-1.768 1.768A2.6 2.6 0 1 1 3.44 8.884l1.167-1.167"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-width="1.3"
            />
          </svg>
        </a>
      </td>
      <td>
        <div class="tx-table__cell mx-4 w-32">
          <ui-timeago :timestamp="tx.now * 1000 || 0" />
        </div>
      </td>
      <td>
        <div class="tx-table__cell tx-table__cell--align-right">
          <span v-if="!sourceAddress">hidden</span>
          <ui-address
            v-else
            :address="sourceAddress.toString({ urlSafe: true, bounceable: true })"
            :disabled="isOut"
          />
        </div>
      </td>
      <td>
        <div class="mx-4" style="padding: 0">
          <div class="p-1 bg-cocoa-500 rounded-lg text-xs font-bold w-10 text-center text-white">
            OUT
          </div>
        </div>
      </td>
      <td>
        <div class="px-4">
          <span>{{ tx.outMessagesCount }} outputs</span>
        </div>
      </td>
      <td>
        <div v-if="amount" class="whitespace-nowrap ml-4 flex items-center justify-end">
          {{ $ton(amount) }} <IconToncoin class="w-4 ml-1" />

          <!-- <svg v-if="message" style="position: absolute; right: 1px;" width="14" height="14" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path d="M0 0h14v14H0z"/><path d="M3.375 1.35h7.3a2 2 0 0 1 2 2v5.3a2 2 0 0 1-2 2H7.6l-2.77 2.424a.5.5 0 0 1-.83-.376V10.65h-.625a2 2 0 0 1-2-2v-5.3a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></g></svg> -->
        </div>
      </td>
      <td>
        <!-- <div class="tx-table__cell">
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
        </div> -->
      </td>
    </tr>
  </tbody>
</template>
