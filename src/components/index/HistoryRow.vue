<script setup lang="ts">
import { abiMap } from '@/abi'
import { getLocalAccountInfo } from '@/api'
import { SearchHistory } from '@/models/SearchHistory'
import { Address, Cell } from '@/ton/src'
import { PropType } from 'vue'
import IconToncoin from '@/assets/images/icon-toncoin.svg'

const props = defineProps({
  item: { type: Object as PropType<SearchHistory>, required: true },
})

// const accountInfo = ref<AccountPlainState | undefined>(undefined)
// watch([props.item.address], async () => {
//   accountInfo.value = await getLocalAccountInfo(props.item.address)
// })

// getLocalAccountInfo(props.item.address).then((v) => {
// accountInfo.value = v
// })
const accountInfo = await getLocalAccountInfo(props.item.address)
const codeHash =
  accountInfo?.state.type === 'active' &&
  accountInfo?.state.code &&
  Cell.fromBoc(Buffer.from(accountInfo?.state.code, 'base64'))[0].hash().toString('hex')

const abi = abiMap[codeHash || '']
</script>

<template>
  <div class="grid grid-cols-[minmax(0,_2fr)_120px_minmax(0,_1fr)_120px] gap-4">
    <div class="flex-1 w-full">
      <UiAddress :address="Address.parse(item.address).toFriendly()" />
    </div>

    <!-- Balance Info -->
    <div class="flex items-center">
      {{ $ton(parseInt(accountInfo?.balance.coins || '0')) }} <IconToncoin class="w-4 ml-2" />
    </div>

    <!-- ContractInfo -->
    <div class="whitespace-nowrap overflow-hidden overflow-ellipsis">{{ abi.name }}</div>
    <div class="whitespace-nowrap overflow-hidden overflow-ellipsis">
      <UiTimeago :timestamp="item.ts" class="ml-4" />
    </div>
  </div>
</template>
