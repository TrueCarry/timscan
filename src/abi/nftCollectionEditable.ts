import { ContractAbi } from '.'

const nftCollectionAbi: ContractAbi = {
  name: 'Standard Tonweb Editable Nft Collection',
  methods: {
    get_collection_data: {
      input: [],
      output: [
        { name: 'next_item_index', type: 'int' },
        {
          name: 'content',
          type: 'cell',
          content: [
            {
              name: 'content',
              type: 'slice',
            },
          ],
        },
        {
          name: 'owner_address',
          type: 'address',
        },
      ],
    },

    get_nft_content: {
      input: [
        { name: 'index', type: 'int' },
        {
          name: 'individual_nft_content',
          type: 'cell',
          content: [
            {
              name: 'contentSlice',
              type: 'slice',
            },
          ],
        },
      ],
      output: [
        {
          name: 'content',
          type: 'cell',
          content: [
            { name: 'index', type: 'int', length: 8 },
            { name: 'content', type: 'slice' },
            {
              name: 'content',
              type: 'cell',
              content: [
                {
                  name: 'contentSlice',
                  type: 'slice',
                },
              ],
            },
          ],
        },
      ],
    },
  },
}

export { nftCollectionAbi }
