<template>
  <section class="card">
    <table style="width: 100%" class="table-fixed">
      <tr>
        <td width="120">Source</td>
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
        <td>{{ $ton(amounts?.value?.coins, false) }} TON</td>
      </tr>

      <tr>
        <td>Direction</td>
        <td>
          <div
            v-if="props.direction === 'out'"
            class="p-1 bg-cocoa-500 rounded-lg text-xs font-bold w-10 text-center text-white"
          >
            OUT
          </div>
          <div
            v-else
            class="p-1 bg-green-500 rounded-lg text-xs font-bold w-10 text-center text-white"
          >
            IN
          </div>
        </td>
      </tr>

      <tr v-if="amounts?.fwdFee">
        <td>Forward fee</td>
        <td>{{ $ton(amounts?.fwdFee) }} TON</td>
      </tr>
      <tr v-if="amounts?.ihrFee">
        <td>IHR fee</td>
        <td>{{ $ton(amounts?.ihrFee) }} TON</td>
      </tr>
      <tr v-if="amounts?.importFee">
        <td>Import fee</td>
        <td>{{ $ton(amounts?.importFee) }} TON</td>
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
        <td>
          <router-link v-if="outTxLt" class="text-navy-300" :to="outTxLt">{{
            createdLt
          }}</router-link>
          <div v-else>{{ createdLt }}</div>
        </td>
      </tr>
      <tr>
        <td>Created At</td>
        <td>{{ new Date(createdAt * 1000) }}</td>
      </tr>
      <tr>
        <td>Body hash</td>
        <td>{{ bodyHash?.toString('hex') }}</td>
      </tr>
      <tr>
        <td>Body Data</td>
        <td class="bg-navy-800 p-2 rounded overflow-hidden">
          <TabsContainer :options="{ useUrlFragment: false }">
            <TabItem name="String"> {{ body.toString() }} </TabItem>
            <TabItem name="Hex"> {{ body.toBoc().toString('hex') }} </TabItem>
            <TabItem name="Base64"> {{ body.toBoc().toString('base64') }} </TabItem>
          </TabsContainer>
        </td>
      </tr>
    </table>
  </section>
</template>

<script setup lang="ts">
import { getTransactions } from '@/api'
import { Transaction } from '@/models/Transaction'
import { Message, loadTransaction, Address, Cell } from 'ton-core'
import { computed, PropType, ref, toRaw, watch } from 'vue'
import lc from '@/liteClient'
import { tr } from 'timeago.js/esm/lang'
import { bigIntToBuffer } from '@/utils/bigIntToBuffer'
import { bufferToBase64Url } from '@/utils/toBase64Url'
import TabsContainer from '../ui/TabsContainer.vue'
import TabItem from '../ui/TabItem.vue'
const props = defineProps({
  tx: {
    type: Object as PropType<Transaction>,
    required: true,
  },
  message: {
    type: Object as PropType<Message>,
    required: true,
  },

  direction: {
    type: String as PropType<'in' | 'out'>,
    required: true,
  },
})

const source = computed(() => {
  return props.message.info.src?.toString({ bounceable: true, urlSafe: true })
})
const destination = computed(() => {
  return props.message.info.dest?.toString({ bounceable: true, urlSafe: true })
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
        fwdFee: props.message.info.forwardFee,
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
  return props.message.body && toRaw(props.message.body).hash()
})
const body = computed(() => {
  return props.message.body && toRaw(props.message.body)
})

const outTxLt = ref('')
const updateOutTxLt = async (message: Message) => {
  if (message.info.type !== 'internal' || !message.info.dest) {
    return
  }

  const dest = message.info.dest
  const masterInfo = await lc.getMasterchainInfo()
  const addressInfo = await lc.getAccountState(Address.parse(dest.toString()), masterInfo.last)

  if (!addressInfo.lastTx) {
    return
  }

  let lastTxLt = addressInfo.lastTx.lt.toString()
  let lastTxHash = bigIntToBuffer(addressInfo.lastTx.hash)

  while (true) {
    const transactions = await getTransactions(dest.toString(), lastTxLt, lastTxHash, 16, true)
    if (transactions.length === 0) {
      console.log('no txes break')
      break
    }

    let found = false
    for (const transaction of transactions) {
      const txCell = Cell.fromBoc(Buffer.from(transaction.data, 'base64'))[0]
      const data = loadTransaction(txCell.asSlice())
      if (data.inMessage?.info.type !== 'internal') {
        continue
      }

      if (String(data.inMessage?.info.createdLt) === createdLt.value.toString()) {
        console.log('same message', data)
        outTxLt.value = `/tx/${String(data.lt)}:${bufferToBase64Url(
          txCell.hash()
        )}:${message.info.dest?.toString({
          urlSafe: true,
          bounceable: true,
        })}`
        found = true
        break
      }
    }

    const lastTx = transactions.at(-1)
    if (lastTx) {
      const lastTxData = loadTransaction(
        Cell.fromBoc(Buffer.from(lastTx.data, 'base64'))[0].asSlice()
      )
      lastTxLt = lastTxData.prevTransactionLt.toString()
      lastTxHash = bigIntToBuffer(lastTxData.prevTransactionHash)
    }

    if (found) {
      break
    }
  }
}

const updateInTxLt = async (message: Message) => {
  if (message.info.type !== 'internal' || !message.info.src) {
    console.log('no dfest')
    return
  }

  const dest = message.info.src
  const masterInfo = await lc.getMasterchainInfo()
  const addressInfo = await lc.getAccountState(Address.parse(dest.toString()), masterInfo.last)

  if (!addressInfo.lastTx) {
    console.log('no last', addressInfo)
    return
  }

  let lastTxLt = addressInfo.lastTx.lt.toString()
  let lastTxHash = bigIntToBuffer(addressInfo.lastTx.hash)

  while (true) {
    const transactions = await getTransactions(dest.toString(), lastTxLt, lastTxHash, 100, true)
    if (transactions.length === 0) {
      break
    }

    let found = false
    for (const transaction of transactions) {
      const txCell = Cell.fromBoc(Buffer.from(transaction.data, 'base64'))[0]
      const data = loadTransaction(txCell.asSlice())

      for (const message of data.outMessages.values()) {
        if (message.info.type !== 'internal') {
          continue
        }

        if (String(message.info.createdLt) === createdLt.value.toString()) {
          console.log('same message', data)
          outTxLt.value = `/tx/${String(data.lt)}:${bufferToBase64Url(
            txCell.hash()
          )}:${message.info.src?.toString({
            urlSafe: true,
            bounceable: true,
          })}`
          found = true
          break
        }
      }
    }

    const lastTx = transactions.at(-1)
    if (lastTx) {
      const lastTxData = loadTransaction(
        Cell.fromBoc(Buffer.from(lastTx.data, 'base64'))[0].asSlice()
      )
      lastTxLt = lastTxData.prevTransactionLt.toString()
      lastTxHash = bigIntToBuffer(lastTxData.prevTransactionHash)
    }

    if (found) {
      break
    }
  }
}
watch([props], async () => {
  outTxLt.value = ''
  if (props.direction === 'out') {
    updateOutTxLt(props.message)
  } else {
    updateInTxLt(props.message)
  }
})
if (props.direction === 'out') {
  updateOutTxLt(props.message)
} else {
  updateInTxLt(props.message)
}
</script>

<style scoped lang="scss">
.tabs-component {
  /* @apply bg-navy-800; */

  :deep(.tabs-component-tabs) {
    @apply flex mb-2;
  }

  :deep(.tabs-component-tab) {
    @apply px-2 rounded overflow-hidden break-all;
    display: inline-block;

    &.is-active {
      @apply bg-navy-500;
    }
  }

  :deep(.tabs-component-panel) {
    @apply px-2 break-all whitespace-pre-wrap;
  }
}
</style>
