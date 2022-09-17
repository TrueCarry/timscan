<script setup lang="ts">
import { CompileResult } from '@ton.org/func-js'
import { Prop, PropType } from 'vue'

const props = defineProps({
  result: {
    type: Object as PropType<CompileResult | null>,
    required: true,
  },
})
</script>

<template>
  <div class="flex flex-col bg-foreground shadow rounded p-4 h-min lg:sticky top-4">
    Output

    <div>Compile result: {{ result }}</div>
  </div>
</template>
