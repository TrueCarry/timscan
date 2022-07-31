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
    <template v-if="input.type === 'int'">
      <div class="card-row__name">{{ input.name }}</div>
      <div class="card-row__value">
        <input
          type="text"
          class="text-black"
          @input="(event) => emit('update:modelValue', (event.target as HTMLInputElement).value)"
        />
      </div>
      <!-- <div class="card-row__value"><value-wrapper :info="output" /></div> -->
    </template>
    <InputCellWrapper
      v-else-if="input.type === 'cell_slice'"
      :input="input"
      @input="(event) => logInput(event)"
    />
    <InputCellWrapper
      v-else-if="input.type === 'cell'"
      :input="input"
      @input="(event) => logInput(event)"
    />
  </div>
</template>
