import { ContractAbi } from '.'

const nftEditableAbi: ContractAbi = {
  name: 'Standard Editable Tonweb NFT',
  methods: {
    get_nft_data: {
      input: [],
      output: [
        { name: 'init', type: 'int', length: 1 },
        { name: 'index', type: 'uint', length: 64 },
        { name: 'collection', type: 'address' },
        { name: 'owner', type: 'address' },
        { name: 'content', type: 'cell_string' },
      ],
    },
    get_editor: {
      input: [],
      output: [{ name: 'editor_address', type: 'address' }],
    },
  },
}

export { nftEditableAbi }
