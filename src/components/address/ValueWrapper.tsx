import BN from 'bn.js'
import { Cell, Slice, TupleItem } from 'ton-core'
import { defineComponent, toRaw } from 'vue'
import { OutputArg, OutputResult } from '@/abi'
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

    value?: TupleItem
    content?: OutputArg[]
  }
}) {
  try {
    if (!info) {
      return <></>
    }

    console.log('info check', info)

    const val = info.value
    if (!val) {
      return
    }

    // const value = val.value
    // if (val.value.type)

    console.log('check value type', val)
    switch (info.type) {
      case 'uint':
      case 'int': {
        if (info.value?.type !== 'int') {
          throw new Error('wrong value')
        }
        const boolean = info.value.value.toString()

        return <div class="flex overflow-hidden break-words break-all">{boolean}</div>
      }

      case 'address': {
        if (
          info.value?.type !== 'cell' &&
          info.value?.type !== 'builder' &&
          info.value?.type !== 'slice'
        ) {
          throw new Error('wrong value')
        }
        const address = info.value.cell.asSlice().loadAddress()
        return (
          <div class="flex overflow-hidden break-words break-all">
            {address?.toString({ bounceable: true, urlSafe: true })}
          </div>
        )
      }
      // case 'dict': {
      //   const cell = toRaw(info.value as Cell).beginParse()
      //   const dict = cell.readDict(256, (x) => x)
      //   const kvs = [...dict.entries()]
      //   return (
      //     <div class="flex overflow-hidden break-words break-all">
      //       {kvs.map(([key, value]) => {
      //         return (
      //           <div class="pl-4">
      //             <div class="text-secondary">{key}:</div>
      //             <ValueCellWrapper
      //               info={{
      //                 ...info,
      //                 type: 'cell',
      //                 value: toRaw(value),
      //               }}
      //               level={2}
      //               class="ml-4"
      //             />
      //           </div>
      //         )
      //       })}
      //     </div>
      //   )
      // }
      case 'cell': {
        return <ValueCellWrapper info={info} class="ml-4" />
      }
      default: {
        return <div class="flex overflow-hidden break-words break-all">Unknown Default</div>
      }
    }
  } catch (e) {
    console.log('value wrapper error', e)
    return <div>Error</div>
  }
}
