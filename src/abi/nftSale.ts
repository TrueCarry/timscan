import { ContractAbi } from '.'

const nftSaleAbi: ContractAbi = {
  name: 'Unknown Nft Sale',
  methods: {
    get_sale_data: {
      input: [],
      output: [
        { name: 'marketplace_address', type: 'address' },
        { name: 'nft_address', type: 'address' },
        { name: 'nft_owner_address', type: 'address' },
        { name: 'full_price', type: 'int' },
        { name: 'marketplace_fee', type: 'int' },
        { name: 'royalty_address', type: 'address' },
        { name: 'royalty_amount', type: 'int' },
      ],
    },
  },
}

export { nftSaleAbi }
