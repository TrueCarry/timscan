import { ContractAbi } from '.'

const walletAbi: ContractAbi = {
  methods: {
    get_public_key: {
      input: [],
      output: [{ name: 'public_key', type: 'int', length: 256 }],
    },
  },
}

export default walletAbi
