import { ContractAbi } from '.'

const getgemsOffer: ContractAbi = {
  name: 'Getgetms Nft Offer',
  methods: {
    get_offer_data: {
      input: [],
      output: [
        { name: 'sale_type', type: 'int' },
        { name: 'is_complete', type: 'int' },
        { name: 'created_at', type: 'int' },
        { name: 'finish_at', type: 'int' },

        { name: 'marketplace_address', type: 'address' },
        { name: 'nft_address', type: 'address' },
        { name: 'offer_owner_address', type: 'address' },
        { name: 'full_price', type: 'int' },
        { name: 'marketplace_fee_address', type: 'address' },
        { name: 'marketplace_factor', type: 'int' },
        { name: 'marketplace_base', type: 'int' },
        { name: 'royalty_address', type: 'address' },
        { name: 'royalty_factor', type: 'int' },
        { name: 'royalty_base', type: 'int' },
        { name: 'profit_price', type: 'int' },
      ],
    },
  },
}

export { getgemsOffer }
