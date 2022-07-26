import { ContractAbi } from '.'

const nftSaleAbi: ContractAbi = {
  name: 'Unknown Nft Sale',
  methods: {
    get_sale_data: {
      input: [],
      output: [
        { name: 'marketplace_address', type: 'address', length: 256 },
        { name: 'nft_address', type: 'address', length: 256 },
        { name: 'nft_owner_address', type: 'address', length: 256 },
        { name: 'full_price', type: 'int', length: 256 },
        { name: 'marketplace_fee', type: 'int', length: 256 },
        { name: 'royalty_address', type: 'address', length: 256 },
        { name: 'royalty_amount', type: 'int', length: 256 },
      ],
    },
  },
}

export { nftSaleAbi }
