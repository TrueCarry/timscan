<template>
  <div class="flex flex-col">
    <div class="flex border-b border-gray-400 py-2">
      <div class="flex w-32">Name</div>
      <div class="">{{ addressStore.abi?.name || 'Unknown' }}</div>
    </div>

    <div class="flex border-b border-gray-400 py-2">
      <div class="flex shrink-0 w-32">Code</div>
      <div class="break-words text-xs break-all">{{ addressStore.code }}</div>
    </div>

    <div class="flex border-b border-gray-400 py-2">
      <div class="flex w-32">Code Hash</div>
      <div class="card-row__value">{{ codeHash }}</div>
    </div>

    <div class="flex border-b border-gray-400 py-2">
      <div class="flex shrink-0 w-32">Data</div>
      <div class="break-words text-xs break-all">{{ addressStore.data }}</div>
    </div>

    <template v-if="addressStore.abi && codeCell && dataCell">
      <div class="mt-4">Methods:</div>

      <MethodWrapper
        v-for="(info, method) in (addressStore.abi.methods as {})"
        :key="method"
        :name="method"
        :abi="info"
        :code-cell="codeCell"
        :data-cell="dataCell"
        :address="Address.parse(addressStore.wallet?.address || '')"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { Address, Cell } from '@/ton/src'
import MethodWrapper from './MethodWrapper.vue'
import { useAddressStore } from '@/stores/address'

const addressStore = useAddressStore()

const codeCell = computed((): Cell | null => {
  return addressStore.code ? Cell.fromBoc(Buffer.from(addressStore.code, 'base64'))[0] : null
})

const dataCell = computed(() => {
  return addressStore.data && Cell.fromBoc(Buffer.from(addressStore.data, 'base64'))[0]
})

const codeHash = computed(() => {
  return codeCell.value && codeCell.value.hash().toString('hex')
})
</script>
