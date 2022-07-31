import { ContractAbi } from '.'

const nftCollectionAbi: ContractAbi = {
  name: 'Standard Tonweb Editable Nft Collection',
  methods: {
    // get_collection_data: {
    //   input: [],
    //   output: [
    //     { name: 'next_item_index', type: 'int' },
    //     { name: 'content', type: 'cell_maybe_string' },
    //     { name: 'owner_address', type: 'address' },
    //   ],
    // },
    // get_nft_address_by_index: {
    //   input: [{ name: 'index', type: 'int' }],
    //   output: [{ name: 'address', type: 'address' }],
    // },
    // royalty_params: {
    //   input: [],
    //   output: [
    //     { name: 'royalty_factor', type: 'int' },
    //     { name: 'royalty_base', type: 'int' },
    //     { name: 'royalty_address', type: 'address' },
    //   ],
    // },
    get_nft_content: {
      input: [
        { name: 'index', type: 'int' },
        {
          name: 'individual_nft_content',
          type: 'cell',
          content: [
            { name: 'offchain', type: 'int', length: 8 },
            {
              name: 'contentCell',
              type: 'cell',
              content: [
                {
                  name: 'contentSlice',
                  type: 'slice',
                  // content: [{ name: 'url', type: 'slice' }],
                },
              ],
            },
          ],
        },
        // { name: 'individual_nft_content', type: 'cell_string' },
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
                  // content: [{ name: 'url', type: 'slice' }],
                },
              ],
            },
          ],
        },
      ],
    },

    dnsresolve: {
      input: [
        {
          name: 'subdomain',
          type: 'cell_slice',
          content: [
            {
              name: 'terminator',
              type: 'int',
              length: 8,
            },
            {
              name: 'domain',
              type: 'slice',
            },
            {
              name: 'terminator',
              type: 'int',
              length: 8,
            },
          ],
        },
        { name: 'category', type: 'int' },
      ],
      output: [
        { name: 'index', type: 'int' },
        // { name: 'content', type: 'cell_string' },
        {
          name: 'content',
          type: 'cell',
          content: [
            { name: 'index', type: 'uint', length: 16 },
            { name: 'content', type: 'address' },
          ],
        },
      ],
    },
    //   get_nft_address_by_index(int index) method_id {
    //     var (_, _, _, nft_item_code, _) = load_data();
    //     cell state_init = calculate_nft_item_state_init(index, nft_item_code);
    //     return calculate_nft_item_address(0, state_init);
    // }
    // get_subwallet_id: {
    //   input: [],
    //   output: [{ name: 'subwallet_id', type: 'int', length: 32 }],
    // },
    // get_public_key: {
    //   input: [],
    //   output: [{ name: 'public_key', type: 'int', length: 256 }],
    // },
  },
}

export { nftCollectionAbi }
