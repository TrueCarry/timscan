<template>
  <div class="flex flex-col bg-foreground shadow rounded p-4 mt-4">
    <div class="flex py-2">
      <div class="flex w-32">Name</div>
      <div class="">{{ addressStore.abi?.name || 'Unknown' }}</div>
    </div>

    <div class="flex py-2">
      <div class="flex shrink-0 w-32">Code</div>
      <textarea
        class="outline-none break-words p-2 rounded break-all w-full bg-navy-800"
        rows="3"
        :value="addressStore.code"
      />
    </div>

    <div class="flex py-2">
      <div class="flex w-32">Code Hash</div>
      <div class="card-row__value">{{ codeHash }}</div>
    </div>

    <div class="flex py-2">
      <div class="flex shrink-0 w-32">Data</div>
      <textarea
        class="outline-none break-words w-full p-2 rounded break-all bg-navy-800"
        rows="3"
        :value="addressStore.data"
      />
    </div>

    <div class="flex py-2">
      <div class="flex shrink-0 w-32">ABI</div>
      <textarea
        class="outline-none break-words w-full p-2 rounded break-all bg-navy-800"
        rows="3"
        :value="JSON.stringify(addressStore.abi, null, 2)"
      />
    </div>
  </div>

  <template v-if="addressStore.abi && codeCell && dataCell">
    <!-- <div class="mt-4">Methods:</div> -->

    <MethodWrapper
      v-for="(info, method) in (addressStore.abi.methods as {})"
      :key="method"
      class="bg-foreground shadow rounded p-4 mt-4"
      :name="method"
      :abi="info"
      :code-cell="codeCell"
      :data-cell="dataCell"
      :address="Address.parse(addressStore.wallet?.address || '')"
    />
  </template>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { Address, Cell } from 'ton-core'
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
