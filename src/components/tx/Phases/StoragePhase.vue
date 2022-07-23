<script setup lang="ts">
import { PropType } from 'vue'
import { Transaction } from '@/models/Transaction'

const props = defineProps({
  tx: {
    type: Object as PropType<Transaction>,
    required: true,
  },
})
</script>

<template>
  <div class="tx-page-msg">
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
          <td>{{ tx.description.storagePhase?.storageFeesCollected }}</td>
        </tr>
        <tr>
          <td>Storage Fees Due</td>
          <td>{{ tx.description.storagePhase?.storageFeesDue?.toNumber() || 0 }}</td>
        </tr>
        <tr>
          <td>Status Change</td>
          <td>{{ tx.description.storagePhase?.statusChange }}</td>
        </tr>
      </table>
    </section>
  </div>
</template>
