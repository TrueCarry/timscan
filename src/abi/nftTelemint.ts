import { ContractAbi } from '.'

const telemintNftAbi: ContractAbi = {
  name: 'Telemint NFT',
  methods: {
    get_nft_data: {
      input: [],
      output: [
        { name: 'init', type: 'int' },
        { name: 'index', type: 'uint' },
        { name: 'collection', type: 'address' },
        { name: 'owner', type: 'address' },
        {
          name: 'content',
          type: 'cell',
          content: [{ name: 'contentUri', type: 'slice' }],
        },
      ],
    },

    get_telemint_auction_state: {
      input: [],
      output: [
        { name: 'bidder_address', type: 'address' },
        { name: 'bid', type: 'uint' },
        { name: 'bid_ts', type: 'uint' },
        { name: 'min_bid', type: 'uint' },
        { name: 'end_time', type: 'uint' },
      ],
    },

    get_telemint_auction_config: {
      input: [],
      output: [
        { name: 'beneficiary_address', type: 'address' },
        { name: 'initial_min_bid', type: 'uint' },
        { name: 'max_bid', type: 'uint' },
        { name: 'min_bid_step', type: 'uint' },
        { name: 'min_extend_time', type: 'uint' },
        { name: 'duration', type: 'uint' },
      ],
    },
  },
}

export { telemintNftAbi }
