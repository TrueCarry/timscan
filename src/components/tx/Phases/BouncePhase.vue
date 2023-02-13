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
      <span class="tx-table__badge tx-table__badge--in">Bounce</span>
    </div>

    <section
      v-if="tx.description.type === 'generic'"
      style="overflow-x: auto; width: 100%; scrollbar-width: none"
      class="tx-page-msg-details"
    >
      <table v-if="tx.description.bouncePhase" style="width: 100%">
        <tr>
          <td>Type</td>
          <td>{{ tx.description.bouncePhase.type }}</td>
        </tr>

        <template v-if="tx.description.bouncePhase.type !== 'negative-funds'">
          <template v-if="tx.description.bouncePhase?.type === 'ok'">
            <tr>
              <td>Message fees</td>
              <td>{{ $ton(tx.description.bouncePhase.messageFees) }}</td>
            </tr>

            <tr>
              <td>Forward Fees</td>
              <td>{{ $ton(tx.description.bouncePhase.forwardFees) }}</td>
            </tr>
          </template>

          <template v-if="tx.description.bouncePhase?.type === 'no-funds'">
            <tr>
              <td>Required Forward Fees</td>
              <td>{{ $ton(tx.description.bouncePhase.requiredForwardFees) }}</td>
            </tr>
          </template>

          <tr>
            <td>Message size</td>
            <td v-if="tx.description.bouncePhase.messageSize">
              cells: {{ tx.description.bouncePhase.messageSize.cells }}, bits:
              {{ tx.description.bouncePhase.messageSize.bits }}
            </td>
            <td v-else>cells: 0, bits: 0</td>
          </tr>
        </template>
      </table>
    </section>
  </div>
</template>
