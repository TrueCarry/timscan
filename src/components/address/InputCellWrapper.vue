<script setup lang="ts">
import { InputArg, OutputArg, CellContent } from '@/abi'
import { Cell } from '@/ton/src'
import BN from 'bn.js'
import { watch, PropType, ref, toRaw, reactive } from 'vue'

const props = defineProps({
  input: { type: Object as PropType<InputArg | CellContent>, required: true },
})

const emit = defineEmits(['input', 'update:modelValue'])

const inputValue = ref<string>('')
const inputs = reactive({})

watch(inputs, (oldVal, newVal) => {
  console.log('inputs update', oldVal, newVal)
  const cell = new Cell()
  if (props.input.content) {
    try {
      for (let i = 0; i < props.input.content.length; i++) {
        const inputContent = props.input.content[i]
        if (inputContent.type === 'int') {
          cell.bits.writeInt(new BN(inputs[i]), inputContent.length || 0)
          console.log('writeInt', inputs[i], inputContent.length)
        } else if (inputContent.type === 'slice') {
          cell.bits.writeBuffer(Buffer.from([...new TextEncoder().encode(inputs[i])]))
        } else if (inputContent.type === 'cell') {
          const boc = inputs[i]
          console.log('type cell', boc)

          const ref = Cell.fromBoc(Buffer.from(boc, 'base64'))[0]
          cell.refs.push(ref)
        }
      }
    } catch (e) {
      console.log('parse error', e)
    }
  }

  console.log('bits', cell.beginParse().readRemainingBytes())

  const boc = cell.toBoc({ idx: false }).toString('base64')
  console.log('boc', boc)
  emit('update:modelValue', boc)
  emit('input', boc)
})
</script>

<template>
  <div v-for="(inputContent, i) in input.content" :key="i" class="card-row">
    <template v-if="inputContent.type === 'int'">
      <div class="card-row__name">{{ inputContent.name }}</div>
      <div class="card-row__value">
        <input v-model="inputs[i]" type="text" class="text-black" />
      </div>
    </template>
    <template v-else-if="inputContent.type === 'slice'">
      <div class="card-row__name">{{ inputContent.name }}</div>
      <div class="card-row__value">
        <input v-model="inputs[i]" type="text" class="text-black" />
      </div>
    </template>
    <template v-else-if="inputContent.type === 'cell'">
      <InputCellWrapper v-model="inputs[i]" :input="inputContent" />
    </template>
  </div>
</template>
