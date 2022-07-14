<template>
  <div class="card">
    <div class="card-row">
      <div class="card-row__name">Code</div>
      <div class="card-row__value">{{codeString}}</div>
    </div>

    <div class="card-row">
      <div class="card-row__name">Data</div>
      <div class="card-row__value">{{dataString}}</div>
    </div>

    <div class="card-row">
      Methods:
    </div>
    
    <div class="card-row" v-for="(info, method) in abi.methods" :key="method">
      <div class="card-row__name">{{method}}</div>
      <div class="card-row__value">

        <div class="card-row" v-for="(output, i) in results[method]" :key="i">
          <div class="card-row__name">{{output.name}}</div>
          <div class="card-row__value"><value-wrapper :info="output" /></div>
        </div>

      </div>
              <!-- {{results[method]}}</div> -->


    </div>
  </div>
</template>

<script>
// import Vue from 'vue'
import {SmartContract} from "~/ton-contract-executor/src";
import ValueWrapper from './ValueWrapper.tsx';
import { isProxy, toRaw } from 'vue';

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

const abiMap = {
  '4c9123828682fa6f43797ab41732bca890cae01766e0674100250516e0bf8d42': abiNft, // standard nft
  '9892766765d3ea42809a417abbd7ff9ce681b145d05ae6b118a614b38c8ded15': abiNft, // standard editable nft
  'feb5ff6820e2ff0d9483e7e0d62c817d846789fb4ae580c878866d959dabd5c0': abiWallet
}



export default {
  components: { ValueWrapper },
  props: {
    code: {
      type: Object,
      required: true
    },
    data: {
      type: Object,
      required: true
    }
  },

  computed: {
    abi () {
      const abi = this.code.kind && abiMap[toRaw(this.code).hash().toString('hex')] || []
      console.log('abi', abi)
      return abi
    },

    codeString() {
      return this.code.kind && toRaw(this.code).toBoc().toString('base64')
    },

    dataString() {
      return this.data.kind && toRaw(this.data).toBoc().toString('base64')
    }
  },

  data () {
    return {
      results: {

      }
    }
  },

  watch: {
    async code () {
      console.log('async code')
      if (!this.code.kind || !this.data.kind) {
        return
      }
      for (const method of Object.keys(this.abi.methods)) {
        const info = this.abi.methods[method]
        console.log('info abi', info)
        const res = await this.callMethod(method, info)
        console.log(res)
        const tmp = {
          ...this.results
        }
        tmp[method] = res
        this.results = tmp
      }
    }
  },


  methods: {
    async callMethod(name, info) {
      console.log(1, this.code.target, this.data)
      let wallet = await SmartContract.fromCell(toRaw(this.code), toRaw(this.data))
      console.log(2)
      let res = await wallet.invokeGetMethod(name, [])
      console.log(3)

      if (res.type !== 'success') {
        console.log('not type', res.type)
        console.log(res)
        return res
      }

      if (res.exit_code !== 0) {
        return res
      }

      const values = []
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
    }
  }
}
</script>