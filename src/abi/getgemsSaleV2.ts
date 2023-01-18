import { ContractAbi } from '.'

const getgemsSaleV2: ContractAbi = {
  name: 'Getgetms Nft Sale V2',
  methods: {
    get_sale_data: {
      input: [],
      output: [
        { name: 'sale_type', type: 'int' },
        { name: 'isComplete', type: 'int' },
        { name: 'createdAt', type: 'int' },
        { name: 'marketplace_address', type: 'address' },
        { name: 'nft_address', type: 'address' },
        { name: 'nft_owner_address', type: 'address' },
        { name: 'full_price', type: 'int' },
        { name: 'marketplace_fee_address', type: 'address' },
        { name: 'marketplace_fee', type: 'int' },
        { name: 'royalty_address', type: 'address' },
        { name: 'royalty_amount', type: 'int' },
      ],
    },
  },
}

export { getgemsSaleV2 }
