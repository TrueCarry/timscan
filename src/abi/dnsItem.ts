import { ContractAbi } from '.'

const dnsItemAbi: ContractAbi = {
  name: 'DNS NFT',
  methods: {
    get_domain: {
      input: [],
      output: [
        {
          name: 'content',
          type: 'cell',
          content: [{ name: 'contentUri', type: 'slice' }],
        },
      ],
    },
    get_nft_data: {
      input: [],
      output: [
        { name: 'init', type: 'int' },
        { name: 'index', type: 'uint' },
        { name: 'collection', type: 'address' },
        { name: 'owner', type: 'address' },
        {
          name: 'content',
          type: 'dict',
          content: [
            {
              name: 'address cell',
              type: 'cell',
              content: [
                { name: 'garbage', type: 'int', length: 16 },
                { name: 'address', type: 'address' },
              ],
            },
          ],
        },
      ],
    },
    dnsresolve: {
      input: [
        {
          name: 'subdomain',
          type: 'cell_slice',
          content: [
            {
              name: 'terminator',
              type: 'int',
              length: 8,
            },
          ],
        },
        { name: 'category', type: 'int' },
      ],
      output: [
        { name: 'index', type: 'int' },
        {
          name: 'content',
          type: 'cell',
          content: [
            {
              name: 'address cell',
              type: 'cell',
              content: [
                { name: 'garbage', type: 'int', length: 16 },
                { name: 'address', type: 'address' },
              ],
            },
          ],
        },
      ],
    },
  },
}

export { dnsItemAbi }
