import { ContractAbi } from '.'

const getgemsAuctionV2Abi: ContractAbi = {
  name: 'Getgems NFT Auction V2',
  methods: {
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

export { getgemsAuctionV2Abi }
