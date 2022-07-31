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

      return <div>{boolean}</div>
    }
    case 'address': {
      const address = (info.value as Slice).readAddress()
      console.log('val', info)
      return <div>{address?.toFriendly({ bounceable: true, urlSafe: true })}</div>
    }
    case 'cell_string': {
      const data = (toRaw(info.value) as Cell).beginParse().readRemainingBytes()

      return <div>{data.toString()}</div>
    }
    case 'cell_maybe_string': {
      const slice = (toRaw(info.value) as Cell).beginParse()
      slice.readBitString(8)
      const data = slice.readRemainingBytes()

      return <div>{data.toString()}</div>
    }
    case 'cell': {
      return <ValueCellWrapper info={info} />
      // if (!info.value) {
      //   return <></>
      // }
      // const slice = (toRaw(info.value) as Cell).beginParse()

      // return (
      //   <>
      //     {info.content?.map((out) => {
      //       switch (out.type) {
      //         case 'int': {
      //           return <>Int: {slice.readInt(out.length || slice.remaining).toString()} </>
      //         }
      //         case 'uint': {
      //           return <>UInt: {slice.readUint(out.length || slice.remaining).toString()} </>
      //         }
      //         case 'ref': {
      //           return <>Ref: {slice.readRef().readRemainingBytes().toString()}</>
      //         }
      //         case 'address': {
      //           return (
      //             <>
      //               Address: {slice.readAddress()?.toFriendly({ bounceable: true, urlSafe: true })}{' '}
      //             </>
      //           )
      //         }
      //         case 'slice': {
      //           return <>Slice: {slice.readRemainingBytes().toString()}</>
      //         }
      //         default: {
      //           return (
      //             <>
      //               Default({out.type}): {JSON.stringify(slice.readRemainingBytes().toString())}
      //             </>
      //           )
      //         }
      //       }
      //     })}
      //   </>
      // )
      // return doRender({ info: {
      //   name: info.name,
      //   type:
      // } })
    }
    default:
      return <div>{JSON.stringify(info)}</div>
  }
}
