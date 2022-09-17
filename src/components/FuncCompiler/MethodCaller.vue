<script setup lang="ts">
import { ContractAbi, InputArg, MethodAbi } from '@/abi'
import { Cell, Address } from '@/ton/src'
import { CompileResult } from '@ton.org/func-js'
import { computed, Prop, PropType, ref } from 'vue'
import MethodWrapper from '../address/MethodWrapper.vue'

const exampleMethod: MethodAbi = {
  input: [
    {
      name: 'a',
      type: 'int',
    },
    {
      name: 'b',
      type: 'int',
    },
  ],
  output: [
    {
      name: 'int',
      type: 'int',
    },
  ],
}

const showModal = ref(false)
const newMethodName = ref('')

const abi = ref<ContractAbi>({
  name: 'playground',
  methods: {
    main: { ...exampleMethod },
  },
})
const props = defineProps({
  result: {
    type: Object as PropType<CompileResult | null>,
    required: true,
  },
})

const dataCell = new Cell()
const codeCell = computed(() => {
  if (props.result?.status !== 'ok') {
    return new Cell()
  }

  const boc = Cell.fromBoc(Buffer.from(props.result.codeBoc, 'base64'))
  console.log('cell changed')
  return boc[0]
})

function openPopup() {
  // abi.value.methods.x = { ...exampleMethod }
  showModal.value = true
}

function addMethod() {
  abi.value.methods[newMethodName.value] = {
    input: [],
    output: [],
    // name: newMethodName.value,
  }
  newMethodName.value = ''
  showModal.value = false
  // showModal.value = true
}

function addInput(method: string) {
  const newInput: InputArg = {
    name: 'x',
    type: 'int',
  }
  abi.value.methods[method].input.push(newInput)
}
</script>

<template>
  <div class="flex flex-col bg-foreground shadow rounded p-4 h-min lg:sticky top-4">
    Methods:

    <!-- <div>Compile result: {{ result }}</div> -->
    <MethodWrapper
      v-for="(info, method) in (abi.methods as {})"
      :key="method"
      class="bg-foreground shadow rounded p-4 mt-4"
      :name="method"
      :abi="info"
      :code-cell="codeCell"
      :data-cell="dataCell"
      :address="Address.parse('EQCUNkfC75Y7oOlxpfphlbkV4B7sBVtWfE1R8kzEx5ROZX8O')"
      @add-input="addInput(method)"
    />

    <div @click="openPopup">Add method</div>

    <Modal v-model="showModal">
      <div class="text-black">
        Method name:
        <input v-model="newMethodName" type="text" />

        <button @click="addMethod">Add</button>
      </div>
    </Modal>
  </div>
</template>
