import { ContractAbi } from '.'

export const getgemsSwap: ContractAbi = {
  name: 'Getgetms Nft Swap',
  methods: {
    get_trade_state: {
      input: [],
      output: [
        { name: 'state', type: 'int' },
        { name: 'left_ok', type: 'int' },
        { name: 'right_ok', type: 'int' },
        { name: 'left_trader', type: 'int' },
        { name: 'right_trader', type: 'int' },
        { name: 'left_nft', type: 'cell' },
        { name: 'right_nft', type: 'cell' },
        { name: 'left_commission', type: 'int' },
        { name: 'left_surcharge', type: 'int' },
        { name: 'left_coins_got', type: 'int' },
        { name: 'right_commission', type: 'int' },
        { name: 'right_surcharge', type: 'int' },
        { name: 'right_coins_got', type: 'int' },
      ],
    },
  },
}
