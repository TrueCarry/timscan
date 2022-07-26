<template>
  <div class="card">
    <div class="card-row">
      <div class="card-row__name">Name</div>
      <div class="card-row__value">{{ $store.state.address.abi?.name || 'Unknown' }}</div>
    </div>

    <div class="card-row">
      <div class="card-row__name">Code</div>
      <div class="card-row__value">{{ code }}</div>
    </div>

    <div class="card-row">
      <div class="card-row__name">Code Hash</div>
      <div class="card-row__value">{{ codeHash }}</div>
    </div>

    <div class="card-row">
      <div class="card-row__name">Data</div>
      <div class="card-row__value">{{ data }}</div>
    </div>

    <template v-if="$store.state.address.abi && codeCell && dataCell">
      <div class="card-row">Methods:</div>

      <MethodWrapper
        v-for="(info, method) in ($store.state.address.abi.methods as {})"
        :key="method"
        :name="method"
        :abi="info"
        :code-cell="codeCell"
        :data-cell="dataCell"
        :address="address"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { PropType, computed } from 'vue'
import { Address, Cell } from '@/ton/src'
import MethodWrapper from './MethodWrapper.vue'

// export default defineComponent({
const props = defineProps({
  code: {
    type: String,
    required: false,
    default: () => null,
  },
  data: {
    type: String,
    required: false,
    default: () => null,
  },
  address: {
    type: Object as PropType<Address>,
    required: true,
  },
})

const codeCell = computed((): Cell | null => {
  return props.code ? Cell.fromBoc(Buffer.from(props.code, 'base64'))[0] : null
})

const dataCell = computed(() => {
  return props.data && Cell.fromBoc(Buffer.from(props.data, 'base64'))[0]
})

const codeHash = computed(() => {
  return codeCell.value && codeCell.value.hash().toString('hex')
})
</script>
