import { ContractAbi } from '.'

const walletAbi: ContractAbi = {
  name: 'Wallet V3R2',
  methods: {
    seqno: {
      input: [],
      output: [{ name: 'seqno', type: 'int' }],
    },
    get_subwallet_id: {
      input: [],
      output: [{ name: 'subwallet_id', type: 'int' }],
    },
    get_public_key: {
      input: [],
      output: [{ name: 'public_key', type: 'int' }],
    },
  },
}

export { walletAbi }
