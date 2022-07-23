<script setup lang="ts">
import { PropType } from 'vue'
import { Transaction } from '@/models/Transaction'
import StoragePhase from './Phases/StoragePhase.vue'
import ActionPhase from './Phases/ActionPhase.vue'
import ComputePhase from './Phases/ComputePhase.vue'

const props = defineProps({
  tx: {
    type: Object as PropType<Transaction>,
    required: true,
  },
})
</script>

<template>
  <!-- Storage Phase -->

  <div class="tx-page-messages">
    <div class="card-row__name">
      <span class="">Phases</span>
    </div>

    <StoragePhase :tx="tx" />
    <ComputePhase v-if="tx.description.type === 'generic'" :tx="tx" />
    <ActionPhase v-if="tx.description.type === 'generic'" :tx="tx" />
  </div>
</template>
