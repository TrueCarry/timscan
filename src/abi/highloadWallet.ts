import { ContractAbi } from '.'

const highloadWalletAbi: ContractAbi = {
  name: 'HighloadWalletV2',
  methods: {
    get_public_key: {
      input: [],
      output: [{ name: 'public_key', type: 'int', length: 256 }],
    },
  },
}

export { highloadWalletAbi }
