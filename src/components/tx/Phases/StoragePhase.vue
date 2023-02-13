<script setup lang="ts">
import { PropType } from 'vue'
import { Transaction, TransactionGeneric } from '@/models/Transaction'
import { TransactionDescriptionStorage } from 'ton-core'

const props = defineProps({
  tx: {
    type: Object as PropType<TransactionDescriptionStorage>,
    required: true,
  },
})
</script>

<template>
  <div class="card">
    <div class="card-row__name">
      <span class="tx-table__badge tx-table__badge--in">Storage</span>
    </div>

    <section
      style="overflow-x: auto; width: 100%; scrollbar-width: none"
      class="tx-page-msg-details"
    >
      <table style="width: 100%">
        <tr>
          <td>Storage Fees Collected</td>
          <td>{{ tx.storagePhase?.storageFeesCollected }}</td>
        </tr>
        <tr>
          <td>Storage Fees Due</td>
          <td>{{ Number(tx.storagePhase?.storageFeesDue) || 0 }}</td>
        </tr>
        <tr>
          <td>Status Change</td>
          <td>{{ tx.storagePhase?.statusChange }}</td>
        </tr>
      </table>
    </section>
  </div>
</template>
