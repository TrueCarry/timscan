import { ContractAbi } from '.'

const walletAbi: ContractAbi = {
  methods: {
    seqno: {
      input: [],
      output: [{ name: 'seqno', type: 'int', length: 32 }],
    },
    get_subwallet_id: {
      input: [],
      output: [{ name: 'subwallet_id', type: 'int', length: 32 }],
    },
    get_public_key: {
      input: [],
      output: [{ name: 'public_key', type: 'int', length: 256 }],
    },
  },
}

export default walletAbi
