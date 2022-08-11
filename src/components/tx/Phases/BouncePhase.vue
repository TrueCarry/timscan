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
      style="overflow-x: auto; width: 100%; scrollbar-width: none"
      class="tx-page-msg-details"
    >
      <table v-if="tx.description.bouncePhase" style="width: 100%">
        <tr>
          <td>Type</td>
          <td>{{ tx.description.bouncePhase.type }}</td>
        </tr>

        <template v-if="tx.description.bouncePhase.type !== 'negative-funds'">
          <tr>
            <td>Forward Fees</td>
            <td>{{ $ton(tx.description.bouncePhase.fwdFees.toNumber()) }}</td>
          </tr>

          <template v-if="tx.description.bouncePhase?.type === 'ok'">
            <tr>
              <td>Message fees</td>
              <td>{{ $ton(tx.description.bouncePhase.msgFees.toNumber()) }}</td>
            </tr>
          </template>

          <tr>
            <td>Message size</td>
            <td v-if="tx.description.bouncePhase.msgSize">
              cells: {{ tx.description.bouncePhase.msgSize.cells }}, bits:
              {{ tx.description.bouncePhase.msgSize.bits }}
            </td>
            <td v-else>cells: 0, bits: 0</td>
          </tr>
        </template>
      </table>
    </section>
  </div>
</template>
