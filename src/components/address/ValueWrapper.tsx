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
    case 'dict': {
      const cell = toRaw(info.value as Cell).beginParse()
      const dict = cell.readDict(256, (x) => x)
      const kvs = [...dict.entries()]
      return (
        <div class="flex overflow-hidden break-words break-all">
          {kvs.map(([key, value]) => {
            return (
              <div>
                <div class="ml-4 text-secondary">{key}:</div>
                <ValueCellWrapper
                  info={{
                    ...info,
                    type: 'cell',
                    value: toRaw(value),
                  }}
                  class="ml-8"
                />
              </div>
            )
          })}
          {info.value as Slice}
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
