<script setup lang="ts">
import { PropType } from 'vue'
import { Transaction, TransactionGeneric } from '@/models/Transaction'

const props = defineProps({
  tx: {
    type: Object as PropType<TransactionGeneric>,
    required: true,
  },
})
</script>

<template>
  <div class="card">
    <div class="card-row__name">
      <span class="tx-table__badge tx-table__badge--in">Action</span>
    </div>

    <section
      style="overflow-x: auto; width: 100%; scrollbar-width: none"
      class="tx-page-msg-details"
    >
      <table style="width: 100%">
        <tr>
          <td>Success</td>
          <td>{{ tx.description.actionPhase?.success }}</td>
        </tr>
        <tr>
          <td>Valid</td>
          <td>{{ tx.description.actionPhase?.valid }}</td>
        </tr>
        <tr>
          <td>No funds</td>
          <td>{{ tx.description.actionPhase?.noFunds }}</td>
        </tr>
        <tr>
          <td>Status Change</td>
          <td>{{ tx.description.actionPhase?.statusChange }}</td>
        </tr>
        <tr>
          <td>Total Forward Fees</td>
          <td>{{ $ton(tx.description.actionPhase?.totalFwdFees?.toNumber()) }}</td>
        </tr>
        <tr>
          <td>Total Action Fees</td>
          <td>{{ $ton(tx.description.actionPhase?.totalActionFees?.toNumber()) }}</td>
        </tr>
        <tr>
          <td>Result Code</td>
          <td>{{ tx.description.actionPhase?.resultCode }}</td>
        </tr>
        <tr>
          <td>Exit Arg</td>
          <td>{{ tx.description.actionPhase?.resultArg || 'none' }}</td>
        </tr>
        <tr>
          <td>Total Actions</td>
          <td>{{ tx.description.actionPhase?.totalActions }}</td>
        </tr>
        <tr>
          <td>Special Actions</td>
          <td>{{ tx.description.actionPhase?.specialActions }}</td>
        </tr>
        <tr>
          <td>Skipped Actions</td>
          <td>{{ tx.description.actionPhase?.skippedActions }}</td>
        </tr>
        <tr>
          <td>Messages Created</td>
          <td>{{ tx.description.actionPhase?.messagesCreated }}</td>
        </tr>
        <tr>
          <td>Total Messages Size</td>
          <td v-if="tx.description.actionPhase?.totalMessageSizes">
            cells: {{ tx.description.actionPhase?.totalMessageSizes.cells }}, bits:
            {{ tx.description.actionPhase?.totalMessageSizes.bits }}
          </td>
          <td v-else>cells: 0, bits: 0</td>
        </tr>
        <tr>
          <td>Action List Hash</td>
          <td>{{ tx.description.actionPhase?.actionListHash.toString('base64') }}</td>
        </tr>
      </table>
    </section>
  </div>
</template>
