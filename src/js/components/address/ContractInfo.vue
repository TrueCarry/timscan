<template>
  <div class="card">
    <div class="card-row">
      <div class="card-row__name">Code</div>
      <div class="card-row__value">{{code}}</div>
    </div>

    <div class="card-row">
      <div class="card-row__name">Code Hash</div>
      <div class="card-row__value">{{codeHash}}</div>
    </div>

    <div class="card-row">
      <div class="card-row__name">Data</div>
      <div class="card-row__value">{{data}}</div>
    </div>

    <div class="card-row">
      Methods:
    </div>
    
    <div class="card-row" v-for="(info, method) in abi.methods" :key="method">
      <div class="card-row__name">{{method}}</div>
      <div class="card-row__value">

        <div class="card-row" v-for="(output, i) in results[method]" :key="i">
          <template v-if="output">
            <div class="card-row__name">{{output.name}}</div>
            <div class="card-row__value"><value-wrapper :info="output" /></div>
          </template>
        </div>

      </div>
              <!-- {{results[method]}}</div> -->


    </div>
  </div>
</template>

<script lang="ts">
// import Vue from 'vue'
import {SmartContract} from "~/ton-contract-executor/src";
import ValueWrapper from './ValueWrapper'; 
import { isProxy, PropType, toRaw } from 'vue';
import {LiteClient, LiteSingleEngine, LiteRoundRobinEngine} from '../../../ton-lite-client/src/index'
import axios from 'axios';
import {defineComponent} from 'vue'
import { Cell } from "@/ton/src";
import { NormalizedStyle } from "@vue/shared";

const abiNft = {
  methods: {
    get_nft_data: {
      input: [],
      output: [
        {name: 'init', type: 'int', length: 1},
        {name: 'index', type: 'uint', length: 64},
        {name: 'collection', type: 'address' },
        {name: 'owner', type: 'address' },
        {name: 'content', type: 'cell_string' },
      ],
    }
  }
}

const abiWallet = {
  methods: {
    seqno: {
      input: [],
      output: [
        {name: 'seqno', type: 'int', length: 32},
      ],
    },
    get_subwallet_id: {
      input: [],
      output: [
        {name: 'subwallet_id', type: 'int', length: 32},
      ],
    },
    get_public_key: {
      input: [],
      output: [
        {name: 'public_key', type: 'int', length: 256},
      ],
    }
  }
}

const abiHighloadWallet = {
  methods: {
    get_public_key: {
      input: [],
      output: [
        {name: 'public_key', type: 'int', length: 256},
      ],
    }
  }
}

const abiMap = {
  '4c9123828682fa6f43797ab41732bca890cae01766e0674100250516e0bf8d42': abiNft, // standard nft
  '9892766765d3ea42809a417abbd7ff9ce681b145d05ae6b118a614b38c8ded15': abiNft, // standard editable nft
  'feb5ff6820e2ff0d9483e7e0d62c817d846789fb4ae580c878866d959dabd5c0': abiWallet,
  '9494d1cc8edf12f05671a1a9ba09921096eb50811e1924ec65c3c629fbb80812': abiHighloadWallet
}



export default defineComponent({
  components: { ValueWrapper },
  props: {
    code: {
      type: String,
      required: false,
      default: () => null
    },
    data: {
      type: String,
      required: false,
      default: () => null
    }
  },

  computed: {
    abi () {
      if (!this.codeCell) {
        return []
      }
      const abi = this.code && abiMap[toRaw(this.codeCell).hash().toString('hex')] || []
      console.log('abi', abi)
      return abi
    },

    codeCell (): Cell | null {
      return this.code 
        ? Cell.fromBoc(Buffer.from(this.code, 'base64'))[0] 
        : null
    },

    codeHash() {
      return this.codeCell && this.codeCell.hash().toString('hex')
    },

    dataCell () {
      return this.data && Cell.fromBoc(Buffer.from(this.data, 'base64'))[0]
    },

    // codeString() {
    //   return this.code&&this.code.kind && toRaw(this.code).toBoc().toString('base64')
    // },

    // dataString() {
    //   return this.data&&this.data.kind && toRaw(this.data).toBoc().toString('base64')
    // }
  },

  data () {
    return {
      results: {

      }
    }
  },

  // async mounted () {
  //   // const configUrl =
  //   //   process.env.TONCONFIG_URL || 'https://ton-blockchain.github.io/global.config.json'

  //   // const { data } = await axios(configUrl)

  //   // const engines = []
  //   // // while (engines.length < 50) {
  //   //   for (const ls of data.liteservers.slice(0, 1)) {
  //   //     engines.push(
  //   //       new LiteSingleEngine({
  //   //         host: intToIP(ls.ip),
  //   //         port: ls.port,
  //   //         publicKey: Buffer.from(ls.id.key, 'base64'),
  //   //       })
  //   //     )
  //   //   }
  //   // // }

  //   //   const engine = new LiteRoundRobinEngine(engines)
  //   //   const liteClient = new LiteClient({ engine })
  //   //   console.log('lite', liteClient)
  //   // setTimeout(async () => {
  //     console.log('get masterchain_block_title')
  //     const info  = await this.$lc.getMasterchainInfo()
  //     // this.$ton
  //     console.log('masterchain_block_title', info)
  //   // }, 1000)
  // },

  watch: {
    async codeCell () {
      console.log('async code')
      if (!this.code || !this.data || !this.abi.methods) {
        return
      }
      for (const method of Object.keys(this.abi.methods)) {
        const info = this.abi.methods[method]
        console.log('info abi', info)
        const res = await this.callMethod(method, info)
        if (res) {
          console.log(res)
          const tmp = {
            ...this.results
          }
          tmp[method] = res
          this.results = tmp
        }
      }
    }
  },


  methods: {
    async callMethod(name, info) {
      try {
      // console.log(1, this.code.target, this.data)
        if (!this.codeCell || !this.dataCell) {
          return
        }
        let wallet = await SmartContract.fromCell(toRaw<Cell>(this.codeCell), toRaw(this.dataCell))
        // console.log(2)
        let res = await wallet.invokeGetMethod(name, [])
        // console.log(3)

        if (res.type !== 'success') {
          console.log('not type', res.type)
          console.log(res)
          return null
        }

        if (res.exit_code !== 0) {
          return null
        }

        const values: any[] = []
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

      return values
    } catch(e) {
      console.log('e', e)
      return null
    }
    }
  }
})

function intToIP(int) {  
  const part1 = int & 255
  const part2 = (int >> 8) & 255
  const part3 = (int >> 16) & 255
  const part4 = (int >> 24) & 255

  return `${part4}.${part3}.${part2}.${part1}`
}

</script>