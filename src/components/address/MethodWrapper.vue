<script setup lang="ts">
import { MethodAbi, OutputResult } from '@/abi'
import { SmartContract, TVMStack } from '@/ton-contract-executor/src'
import { Address, Cell } from '@/ton/src'
import BN from 'bn.js'
import { watch, computed, PropType, ref, toRaw, reactive } from 'vue'
import ValueWrapper from './ValueWrapper'
import InputWrapper from './InputWrapper.vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  abi: {
    type: Object as PropType<MethodAbi>,
    required: true,
  },
  address: {
    type: Object as PropType<Address>,
    required: true,
  },
  codeCell: {
    type: Object as PropType<Cell>,
    required: true,
  },
  dataCell: {
    type: Object as PropType<Cell>,
    required: true,
  },
})

const inputs = reactive({})

const abiString = computed(() => JSON.stringify(props.abi))
// const result = computed(() => )
const result = ref<OutputResult[] | null | undefined>(null)
callMethod(props.name, props.abi)
watch([abiString, inputs], async () => {
  console.log('inputs called')
  return updateResult()
})
updateResult()

async function updateResult() {
  const res = await callMethod(props.name, props.abi)
  console.log('got res', res)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result.value = res as any
}

async function callMethod(name: string, info: MethodAbi) {
  try {
    if (!props.codeCell || !props.dataCell) {
      return
    }
    const wallet = await SmartContract.fromCell(toRaw<Cell>(props.codeCell), toRaw(props.dataCell))
    wallet.setC7Config({
      myself: props.address,
    })

    const args: TVMStack = []
    let i = 0
    for (const input of props.abi.input) {
      const value = inputs[i] || 0
      args.push({
        type: input.type,
        value: value.toString(),
      })
      i++
    }

    console.log('args', args)
    const res = await wallet.invokeGetMethod(name, args)

    if (res.type !== 'success') {
      console.log('not type', res.type)
      console.log(res)
      return null
    }

    if (res.exit_code !== 0) {
      return null
    }

    const values: OutputResult[] = []
    // console.log(res.results], res)
    for (let i = 0; i < info.output.length; i++) {
      console.log(i)
      switch (info.output[i].type) {
        default: {
          values.push({
            ...info.output[i],
            value: res.result[i],
          })
        }
      }
    }

    console.log('values', values)
    return values
  } catch (e) {
    console.log('e', e)
    return null
  }
}

/**
 * Verify and convert domain
 * @param domain    {string}
 * @return {Uint8Array}
 */
function domainToBytes(domain: string) {
  if (!domain || !domain.length) {
    throw new Error('empty domain')
  }
  if (domain === '.') {
    return new Uint8Array([0])
  }

  domain = domain.toLowerCase()

  for (let i = 0; i < domain.length; i++) {
    if (domain.charCodeAt(i) <= 32) {
      throw new Error('bytes in range 0..32 are not allowed in domain names')
    }
  }

  for (let i = 0; i < domain.length; i++) {
    const s = domain.substring(i, i + 1)
    for (let c = 127; c <= 159; c++) {
      // another control codes range
      if (s === String.fromCharCode(c)) {
        throw new Error('bytes in range 127..159 are not allowed in domain names')
      }
    }
  }

  const arr = domain.split('.')

  arr.forEach((part) => {
    if (!part.length) {
      throw new Error('domain name cannot have an empty component')
    }
  })

  let rawDomain = arr.reverse().join('\0') + '\0'
  if (rawDomain.length < 126) {
    rawDomain = '\0' + rawDomain
  }

  console.log(
    'domain encode',
    new TextEncoder().encode(domain),
    new TextEncoder().encode(rawDomain)
  )
  return new TextEncoder().encode(rawDomain)
}
</script>

<template>
  <div class="card-row">
    <div class="card-row__name !w-60">{{ name }}</div>

    <div class="card-row__value">
      <InputWrapper v-for="(input, i) in abi.input" :key="i" v-model="inputs[i]" :input="input" />
    </div>

    <div class="card-row__value">
      <div v-for="(output, i) in result" :key="i" class="card-row">
        <template v-if="output">
          <div class="card-row__name">{{ output.name }}</div>
          <div class="card-row__value"><value-wrapper :info="output" /></div>
        </template>
      </div>
    </div>
    <!-- {{results[method]}}</div> -->
  </div>
</template>
