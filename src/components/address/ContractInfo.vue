<template>
  <div class="card">
    <div class="card-row">
      <div class="card-row__name">Name</div>
      <div class="card-row__value">{{ abi?.name || 'Unknown' }}</div>
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

    <template v-if="abi && codeCell && dataCell">
      <div class="card-row">Methods:</div>

      <MethodWrapper
        v-for="(info, method) in abi.methods"
        :key="method"
        :name="method"
        :abi="info"
        :code-cell="codeCell"
        :data-cell="dataCell"
        :address="address"
      />
      <!-- <div v-for="(info, method) in abi.methods" :key="method" class="card-row">
        <div class="card-row__name">{{ method }}</div>
        <div class="card-row__value">
          <div v-for="(output, i) in results[method]" :key="i" class="card-row">
            <template v-if="output">
              <div class="card-row__name">{{ output.name }}</div>
              <div class="card-row__value"><value-wrapper :info="output" /></div>
            </template>
          </div>
        </div>
      </div> -->
    </template>
  </div>
</template>

<script lang="ts" setup>
// import Vue from 'vue'
import { SmartContract } from '~/ton-contract-executor/src'
import ValueWrapper from './ValueWrapper'
import { isProxy, PropType, toRaw, defineComponent, computed, ref, watch } from 'vue'
import { LiteClient, LiteSingleEngine, LiteRoundRobinEngine } from '@/ton-lite-client/src/index'
import axios from 'axios'
import { Address, Cell } from '@/ton/src'
import { abiMap, ContractAbi, MethodAbi, OutputResult } from '@/abi'
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

const results = ref({})

const codeCell = computed((): Cell | null => {
  return props.code ? Cell.fromBoc(Buffer.from(props.code, 'base64'))[0] : null
})

const dataCell = computed(() => {
  return props.data && Cell.fromBoc(Buffer.from(props.data, 'base64'))[0]
})

const abi = computed(() => {
  if (!codeCell.value) {
    return null
  }

  const hash = toRaw(codeCell.value).hash().toString('hex')

  return abiMap[hash]
})

// })

const codeHash = computed(() => {
  return codeCell.value && codeCell.value.hash().toString('hex')
})

// const callMethod = async (name: string, info: MethodAbi) => {
//   try {
//     // console.log(1, this.code.target, this.data)
//     if (!codeCell.value || !dataCell.value) {
//       return
//     }
//     const wallet = await SmartContract.fromCell(toRaw<Cell>(codeCell.value), toRaw(dataCell.value))
//     // console.log(2)
//     const res = await wallet.invokeGetMethod(name, [])
//     // console.log(3)

//     if (res.type !== 'success') {
//       console.log('not type', res.type)
//       console.log(res)
//       return null
//     }

//     if (res.exit_code !== 0) {
//       return null
//     }

//     const values: OutputResult[] = []
//     // console.log(res.results], res)
//     for (let i = 0; i < info.output.length; i++) {
//       console.log(i)
//       switch (info.output[i].type) {
//         default: {
//           values.push({
//             ...info.output[i],
//             value: res.result[i],
//           })
//         }
//       }
//     }

//     return values
//   } catch (e) {
//     console.log('e', e)
//     return null
//   }
// }

// const updateData = async () => {
//   console.log('async code')
//   if (!props.code || !props.data || !abi.value) {
//     return
//   }

//   const contractAbi = await abi.value

//   for (const method of Object.keys(contractAbi.methods)) {
//     const info = contractAbi.methods[method]
//     console.log('info abi', info)
//     const res = await callMethod(method, info)
//     if (res) {
//       console.log(res)
//       const tmp = {
//         ...results.value,
//       }
//       tmp[method] = res
//       results.value = tmp
//     }
//   }
// }

// watch(abi, updateData)
// updateData()

// })
</script>
