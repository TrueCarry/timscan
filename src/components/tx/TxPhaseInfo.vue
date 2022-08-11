<script setup lang="ts">
import { PropType } from 'vue'
import { Transaction, TransactionGeneric } from '@/models/Transaction'
import StoragePhase from './Phases/StoragePhase.vue'
import ActionPhase from './Phases/ActionPhase.vue'
import ComputePhase from './Phases/ComputePhase.vue'
import BouncePhase from './Phases/BouncePhase.vue'

const props = defineProps({
  tx: {
    type: Object as PropType<Transaction>,
    required: true,
  },
})
</script>

<template>
  <StoragePhase :tx="tx" />

  <BouncePhase
    v-if="tx.description.type === 'generic' && tx.description.bouncePhase"
    :tx="(tx as TransactionGeneric)"
  />
  <ComputePhase v-if="tx.description.type === 'generic'" :tx="(tx as TransactionGeneric)" />
  <ActionPhase v-if="tx.description.type === 'generic'" :tx="(tx as TransactionGeneric)" />
</template>
