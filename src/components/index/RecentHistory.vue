<script setup lang="ts">
import { useAddressStore } from '@/stores/address'
import HistoryRow from './HistoryRow.vue'

const addressStore = useAddressStore()
</script>

<template>
  <div class="w-full md:container md:max-w-4xl mt-8 px-4 md:px-0">
    <Suspense>
      <HistoryRow v-for="item in addressStore.history" :key="item.address + item.ts" :item="item" />
    </Suspense>
  </div>
</template>
