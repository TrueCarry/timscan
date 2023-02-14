<script setup lang="ts">
import { Message } from 'ton-core'
import { Transaction } from '@/models/Transaction'
import BN from 'bn.js'
import { computed, PropType, ref } from 'vue'
import IconLink from '@/assets/images/icon-link.svg?component'
import IconToncoin from '@/assets/images/icon-toncoin.svg?component'
import { bigIntToAddress } from '@/utils/bigIntToAddress'

type SourceFrom = 'in' | 'out'

const props = defineProps({
  tx: {
    type: Object as PropType<Transaction>,
    required: true,
    // default: () => undefined
  },
  message: {
    type: Object as PropType<Message>,
    required: true,
  },
  source: {
    type: String as PropType<SourceFrom>,
    required: true,
  },
  exitCode: {
    type: Number,
    required: false,
    default: undefined,
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
  return props.message?.info?.src?.toString({ urlSafe: true, bounceable: true })
})
const to = computed(() => {
  return props.message?.info?.dest?.toString({ urlSafe: true, bounceable: true })
})

const isExternal = computed(() => {
  return props.message?.info?.type === 'external-in' || props.message?.info?.type === 'external-out'
})

const amount = computed(() => {
  if (props.message?.info?.type === 'internal') {
    return props.message.info.value.coins
  }
  return 0n
})

const routerUrl = computed(() => {
  return `/tx/${props.tx.lt.toString()}:${fromBase64(
    Buffer.from(props.tx.hash, 'hex').toString('base64')
  )}:${bigIntToAddress(0, props.tx.address).toString({ urlSafe: true, bounceable: true })}`
})

function fromBase64(base64: string): string {
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

const message = computed(() => {
  const body = props.message.body.asSlice()
  if (body.remainingBits < 32) {
    return undefined
  }

  const opcode = body.loadUint(32)
  if (opcode !== 0) {
    return 'OP: 0x' + opcode.toString(16)
  }

  if (body.remainingBits % 8 !== 0) {
    return undefined
  }
  console.log('body.remainingBits', body.remainingBits)

  return body.loadBuffer(body.remainingBits / 8).toString('utf-8')
})
</script>

<template>
  <tbody>
    <tr class="h-12">
      <td>
        <router-link class="tx-table-cell-icon" :to="routerUrl">
          <IconLink class="w-4 h-4" />
        </router-link>
      </td>
      <td>
        <div class="mx-4">
          <ui-timeago :timestamp="tx.now * 1000 || 0" class="whitespace-nowrap" />
        </div>
      </td>
      <td>
        <div v-if="!isExternal" class="px-4 w-full">
          <span v-if="!from">hidden</span>
          <ui-address v-else :address="from" :disabled="isOut" class="" />
        </div>
      </td>
      <td>
        <div class="mx-4" style="padding: 0">
          <div
            v-if="isOut"
            class="p-1 bg-gold-300 rounded-lg text-xs font-bold w-10 text-center text-background"
            :class="isExternal && 'tx-table__badge--service'"
          >
            OUT
          </div>
          <div
            v-else
            class="p-1 bg-green-500 rounded-lg text-xs font-bold w-10 text-center text-white"
            :class="isExternal && 'tx-table__badge--service'"
          >
            IN
          </div>
        </div>
      </td>
      <td>
        <div v-if="to" class="px-4">
          <ui-address :address="to" :disabled="!isOut" class="" />
        </div>
      </td>
      <td>
        <div v-if="amount" class="whitespace-nowrap ml-4 flex items-center justify-end">
          {{ $ton(amount) }} <IconToncoin class="w-4 ml-1" />

          <!-- <svg v-if="message" style="position: absolute; right: 1px;" width="14" height="14" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path d="M0 0h14v14H0z"/><path d="M3.375 1.35h7.3a2 2 0 0 1 2 2v5.3a2 2 0 0 1-2 2H7.6l-2.77 2.424a.5.5 0 0 1-.83-.376V10.65h-.625a2 2 0 0 1-2-2v-5.3a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></g></svg> -->
        </div>
      </td>
      <td>
        <div class="text-right h-6 overflow-hidden text-ellipsis truncate ml-4">{{ message }}</div>
      </td>
      <td>
        <div class="text-right">{{ exitCode }}</div>
      </td>
    </tr>
  </tbody>
</template>
