import { ContractAbi } from '.'

const dnsCollectionAbi: ContractAbi = {
  name: 'DNS Nft Collection',
  methods: {
    get_nft_content: {
      input: [
        { name: 'index', type: 'int' },
        {
          name: 'individual_nft_content',
          type: 'cell',
          content: [
            { name: 'offchain', type: 'int', length: 8 },
            {
              name: 'contentCell',
              type: 'cell',
              content: [
                {
                  name: 'contentSlice',
                  type: 'slice',
                },
              ],
            },
          ],
        },
      ],
      output: [
        {
          name: 'content',
          type: 'cell',
          content: [
            { name: 'index', type: 'int', length: 8 },
            { name: 'content', type: 'slice' },
            {
              name: 'content',
              type: 'cell',
              content: [
                {
                  name: 'contentSlice',
                  type: 'slice',
                },
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
            {
              name: 'domain',
              type: 'slice',
            },
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
            { name: 'index', type: 'uint', length: 16 },
            { name: 'content', type: 'address' },
          ],
        },
      ],
    },
  },
}

export { dnsCollectionAbi }
