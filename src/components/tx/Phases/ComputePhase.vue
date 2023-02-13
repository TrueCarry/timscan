<script setup lang="ts">
import { PropType } from 'vue'
import { Transaction, TransactionGeneric } from '@/models/Transaction'
import { bigIntToBuffer } from '@/utils/bigIntToBuffer'

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
      <span class="tx-table__badge tx-table__badge--in">Compute</span>
    </div>

    <section
      style="overflow-x: auto; width: 100%; scrollbar-width: none"
      class="tx-page-msg-details"
    >
      <table v-if="tx.description.computePhase.type === 'skipped'" style="width: 100%">
        <tr>
          <td>Type</td>
          <td>{{ tx.description.computePhase.type }}</td>
        </tr>
      </table>
      <table v-else>
        <tr>
          <td>Type</td>
          <td>{{ tx.description.computePhase.type }}</td>
        </tr>
        <tr>
          <td>Success</td>
          <td>{{ tx.description.computePhase.success }}</td>
        </tr>
        <tr>
          <td>Message State Used</td>
          <td>{{ tx.description.computePhase.messageStateUsed }}</td>
        </tr>
        <tr>
          <td>Account Activated</td>
          <td>{{ tx.description.computePhase.accountActivated }}</td>
        </tr>
        <tr>
          <td>Gas Fees</td>
          <td>{{ $ton(tx.description.computePhase.gasFees) }}</td>
        </tr>
        <tr>
          <td>Gas Used</td>
          <td>{{ $ton(tx.description.computePhase.gasUsed) }}</td>
        </tr>
        <tr>
          <td>Gas Limit</td>
          <td>{{ $ton(tx.description.computePhase.gasLimit) }}</td>
        </tr>
        <tr>
          <td>Gas Credit</td>
          <td>{{ $ton(tx.description.computePhase.gasCredit) }}</td>
        </tr>
        <tr>
          <td>Mode</td>
          <td>{{ tx.description.computePhase.mode }}</td>
        </tr>
        <tr>
          <td>Exit Code</td>
          <td>{{ tx.description.computePhase.exitCode || 0 }}</td>
        </tr>
        <tr>
          <td>Exit Arg</td>
          <td>{{ tx.description.computePhase.exitArg || 'none' }}</td>
        </tr>
        <tr>
          <td>VM Steps</td>
          <td>{{ tx.description.computePhase.vmSteps }}</td>
        </tr>
        <tr>
          <td>VM Init State Hash</td>
          <td>
            {{ bigIntToBuffer(tx.description.computePhase.vmInitStateHash).toString('base64') }}
          </td>
        </tr>
        <tr>
          <td>VM Final State Hash</td>
          <td>
            {{ bigIntToBuffer(tx.description.computePhase.vmFinalStateHash).toString('base64') }}
          </td>
        </tr>
      </table>
    </section>
  </div>
</template>
