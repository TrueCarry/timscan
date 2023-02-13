<script setup lang="ts">
import { InputArg, OutputArg, CellContent } from '@/abi'
import { Cell } from 'ton-core'
import BN from 'bn.js'
import { watch, PropType, ref, toRaw, reactive } from 'vue'

const props = defineProps({
  input: { type: Object as PropType<InputArg | CellContent>, required: true },
  level: { type: Number, required: false, default: 1 },
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

const colorsList = ['navy', 'indigo', 'pink', 'gold', 'green']
</script>

<template>
  <div class="pl-4 border-l" :class="`border-${colorsList[colorsList.length % level]}-500`">
    <div v-for="(inputContent, i) in input.content" :key="i" class="mt-2">
      <template v-if="inputContent.type === 'int'">
        <div class="text-secondary">{{ inputContent.name }}</div>
        <div class="mt-2">
          <input
            v-model="inputs[i]"
            type="text"
            class="rounded p-1 text-white outline-none bg-navy-800"
          />
        </div>
      </template>
      <template v-else-if="inputContent.type === 'slice'">
        <div class="text-secondary">{{ inputContent.name }}</div>
        <div class="mt-2">
          <input
            v-model="inputs[i]"
            type="text"
            class="rounded p-1 text-white outline-none bg-navy-800"
          />
        </div>
      </template>
      <template v-else-if="inputContent.type === 'cell'">
        <InputCellWrapper
          v-model="inputs[i]"
          :input="inputContent"
          class="px-4 border-l"
          :level="level + 1"
        />
      </template>
    </div>
  </div>
</template>
