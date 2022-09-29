<script setup lang="ts">
import { CompileResult } from '@ton.org/func-js'
import { computed, Prop, PropType } from 'vue'
import CopyArea from '../CopyArea.vue'

const props = defineProps({
  result: {
    type: Object as PropType<CompileResult | null>,
    required: true,
  },
})

const codeBoc = computed(
  () => (props.result?.status === 'ok' && props.result.codeBoc.replaceAll('\\n', '\n')) || ''
)
const fiftCode = computed(
  () => (props.result?.status === 'ok' && props.result.fiftCode.replaceAll('\\n', '\n')) || ''
)
</script>

<template>
  <div class="flex flex-col bg-foreground shadow rounded p-4 h-min lg:sticky top-4">
    Output
    <div>Status: {{ result?.status }}</div>

    <template v-if="result?.status === 'ok'">
      <div>Code boc: <CopyArea :value="codeBoc" /></div>
      <div>Code FIFT: <CopyArea :value="fiftCode" /></div>
    </template>

    <div>Raw Output: <CopyArea :value="JSON.stringify(result, null, 2)" /></div>
  </div>
</template>
