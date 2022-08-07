import BN from 'bn.js'
import { Cell, Slice } from '@/ton/src'
import { defineComponent, toRaw } from 'vue'
import { OutputArg } from '@/abi'
import ValueCellWrapper from './ValueCellWrapper'

export default defineComponent({
  name: 'ValueWrapper',
  props: {
    info: {
      type: Object,
      required: true,
    },
  },

  render: doRender,
})

function doRender({
  info,
}: {
  info: {
    name: string
    type: string

    length?: number

    value?: unknown
    content?: OutputArg[]
  }
}) {
  if (!info) {
    return <></>
  }
  switch (info.type) {
    case 'int':
    case 'uint': {
      const boolean = (info.value as BN).toString()

      return <div class="flex overflow-hidden break-words break-all">{boolean}</div>
    }
    case 'address': {
      const address = (info.value as Slice).readAddress()
      console.log('val', info)
      return (
        <div class="flex overflow-hidden break-words break-all">
          Address: {address?.toFriendly({ bounceable: true, urlSafe: true })}
        </div>
      )
    }
    case 'cell': {
      return <ValueCellWrapper info={info} class="ml-4" />
    }
    default: {
      return <div class="flex overflow-hidden break-words break-all">Unknown Default</div>
    }
  }
}
