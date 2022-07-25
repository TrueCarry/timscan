import { ContractAbi } from '.'

const nftCollectionAbi: ContractAbi = {
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
        { name: 'individual_nft_content', type: 'cell_string' },
      ],
      output: [
        {
          name: 'content',
          type: 'cell',
          content: [
            { name: 'index', type: 'int', length: 8 },
            { name: 'content', type: 'cell_string' },
            { name: 'content', type: 'ref' },
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
