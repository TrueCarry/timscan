import { ContractAbi } from '.'

const getgemsAuctionAbi: ContractAbi = {
  name: 'Getgems NFT Auction',
  methods: {
    get_nft_owner: {
      input: [],
      output: [
        { name: 'wc', type: 'int' },
        { name: 'addr', type: 'int' },
      ],
    },

    get_nft_addr: {
      input: [],
      output: [
        { name: 'wc', type: 'int' },
        { name: 'addr', type: 'int' },
      ],
    },

    get_last_member: {
      input: [],
      output: [
        { name: 'wc', type: 'int' },
        { name: 'addr', type: 'int' },
      ],
    },

    get_mp_addr: {
      input: [],
      output: [
        { name: 'wc', type: 'int' },
        { name: 'addr', type: 'int' },
      ],
    },

    get_mp_fee_addr: {
      input: [],
      output: [
        { name: 'wc', type: 'int' },
        { name: 'addr', type: 'int' },
      ],
    },

    get_royalty_fee_addr: {
      input: [],
      output: [
        { name: 'wc', type: 'int' },
        { name: 'addr', type: 'int' },
      ],
    },

    get_fees_info: {
      input: [],
      output: [
        { name: 'mp_fee_factor', type: 'int' },
        { name: 'mp_fee_base', type: 'int' },
        { name: 'royalty_fee_factor', type: 'int' },
        { name: 'royalty_fee_base', type: 'int' },
      ],
    },

    get_bid_info: {
      input: [],
      output: [
        { name: 'min_bid', type: 'int' },
        { name: 'max_bid', type: 'int' },
        { name: 'min_step', type: 'int' },
        { name: 'last_bid', type: 'int' },
        { name: 'end_time', type: 'int' },
      ],
    },

    get_sale_data: {
      input: [],
      output: [
        { name: 'name', type: 'int' },
        { name: 'end?', type: 'int' },
        { name: 'end_time', type: 'int' },
        { name: 'mp_addr', type: 'address' },
        { name: 'nft_addr', type: 'address' },
        { name: 'nft_owner', type: 'address' },
        { name: 'last_bid', type: 'int' },
        { name: 'last_member', type: 'address' },
        { name: 'min_step', type: 'int' },
        { name: 'mp_fee_addr', type: 'address' },
        { name: 'mp_fee_factor', type: 'int' },
        { name: 'mp_fee_base', type: 'int' },
        { name: 'royalty_fee_addr', type: 'address' },
        { name: 'royalty_fee_factor', type: 'int' },
        { name: 'royalty_fee_base', type: 'int' },
        { name: 'max_bid', type: 'int' },
        { name: 'min_bid', type: 'int' },
        { name: 'created_at?', type: 'int' },
        { name: 'last_bid_at', type: 'int' },
        { name: 'is_canceled?', type: 'int' },
      ],
    },
  },
}

export { getgemsAuctionAbi }
