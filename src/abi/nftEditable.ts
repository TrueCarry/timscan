import { ContractAbi } from '.'

const nftEditableAbi: ContractAbi = {
  name: 'Standard Editable Tonweb NFT',
  methods: {
    get_nft_data: {
      input: [],
      output: [
        { name: 'init', type: 'int' },
        { name: 'index', type: 'int' },
        { name: 'collection', type: 'address' },
        { name: 'owner', type: 'address' },
        {
          name: 'content',
          type: 'cell',
          content: [{ name: 'contentUri', type: 'slice' }],
        },
      ],
    },
    get_editor: {
      input: [],
      output: [{ name: 'editor_address', type: 'address' }],
    },
  },
}

export { nftEditableAbi }
