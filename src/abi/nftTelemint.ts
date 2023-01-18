import { ContractAbi } from '.'

const telemintNftAbi: ContractAbi = {
  name: 'Telemint NFT',
  methods: {
    get_nft_data: {
      input: [],
      output: [
        { name: 'init', type: 'int' },
        { name: 'index', type: 'uint' },
        { name: 'collection', type: 'address' },
        { name: 'owner', type: 'address' },
        {
          name: 'content',
          type: 'cell',
          content: [{ name: 'contentUri', type: 'slice' }],
        },
      ],
    },
  },
}

export { telemintNftAbi }
