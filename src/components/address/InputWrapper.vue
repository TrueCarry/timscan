<script setup lang="ts">
import { InputArg, OutputArg } from '@/abi'
import { watch, PropType, ref, toRaw, reactive } from 'vue'
import InputCellWrapper from './InputCellWrapper.vue'

const props = defineProps({
  input: { type: Object as PropType<InputArg>, required: true },
})

const emit = defineEmits(['input', 'update:modelValue'])

const inputValue = ref<string>('')

const logInput = (x) => {
  console.log('log', x)
  emit('update:modelValue', x)
}
</script>

<template>
  <div v-if="input" class="card-row">
    <div v-if="input.type === 'int'" class="my-2">
      <div class="text-secondary">{{ input.name }}</div>
      <div class="mt-2">
        <input
          type="text"
          class="rounded p-1 text-white outline-none bg-navy-800"
          @input="(event) => emit('update:modelValue', (event.target as HTMLInputElement).value)"
        />
      </div>
    </div>

    <div v-else-if="input.type === 'cell_slice' || input.type === 'cell'" class="my-2">
      <div class="text-secondary">{{ input.name }}</div>
      <InputCellWrapper :input="input" :level="1" @input="(event) => logInput(event)" />
    </div>
  </div>
</template>
