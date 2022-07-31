import { ContractAbi } from '.'

const nftAbi: ContractAbi = {
  name: 'Standard Tonweb NFT',
  methods: {
    get_nft_data: {
      input: [],
      output: [
        { name: 'init', type: 'int' },
        { name: 'index', type: 'uint' },
        { name: 'collection', type: 'address' },
        { name: 'owner', type: 'address' },
        { name: 'content', type: 'cell_string' },
        // {
        //   name: 'some_slice',
        //   type: 'slice',
        //   content: [
        //     { name: 'init', type: 'int', length: 1 },
        //     { name: 'index', type: 'uint', length: 64 },
        //     { name: 'collection', type: 'address' },
        //   ],
        // },
      ],
    },
  },
}

export { nftAbi }
