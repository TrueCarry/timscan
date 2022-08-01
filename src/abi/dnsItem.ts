import { ContractAbi } from '.'

const dnsItemAbi: ContractAbi = {
  name: 'DNS NFT',
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
          content: [
            { name: 'index', type: 'int', length: 8 },
            { name: 'contentUri', type: 'slice' },
          ],
        },
      ],
    },
  },
}

export { dnsItemAbi }
