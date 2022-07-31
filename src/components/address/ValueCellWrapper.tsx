import BN from 'bn.js'
import { Cell, Slice } from '@/ton/src'
import { defineComponent, toRaw } from 'vue'
import { OutputArg, CellContent } from '../../abi'

export default defineComponent({
  name: 'ValueCellWrapper',
  props: {
    info: {
      type: Object,
      required: true,
    },
  },

  render: ValueCellWrapper,
})

function ValueCellWrapper({
  info,
}: {
  info: {
    name: string
    type: string

    length?: number

    value?: unknown
    content?: CellContent[]
  }
}) {
  if (!info) {
    return <></>
  }

  if (!info.value) {
    return <></>
  }

  try {
    const slice =
      info.value instanceof Cell ? (toRaw(info.value) as Cell).beginParse() : (info.value as Slice)

    return (
      <>
        {info.content?.map((out) => {
          switch (out.type) {
            case 'int': {
              return (
                <>
                  {out.name}({out.type}): {slice.readInt(out.length || slice.remaining).toString()}{' '}
                </>
              )
            }
            case 'uint': {
              return (
                <>
                  {out.name}({out.type}): {slice.readUint(out.length || slice.remaining).toString()}{' '}
                </>
              )
            }
            case 'cell': {
              return (
                <>
                  {out.name}({out.type}): (
                  <ValueCellWrapper
                    info={{
                      ...toRaw(out),
                      value: slice.readRef(),
                    }}
                  />
                  )
                </>
              )
            }
            // case 'ref': {
            //   return (
            //     <>
            //       {out.name}({out.type}): {slice.readRef().readRemainingBytes().toString()}
            //     </>
            //   )
            // }
            case 'address': {
              return (
                <>
                  {out.name}({out.type}):{' '}
                  {slice.readAddress()?.toFriendly({ bounceable: true, urlSafe: true })}{' '}
                </>
              )
            }
            case 'slice': {
              return (
                <>
                  {out.name}({out.type}): {slice.readRemainingBytes().toString()}
                </>
              )
            }
            default: {
              return (
                <>
                  Default({out.type}): {JSON.stringify(slice.readRemainingBytes().toString())}
                </>
              )
            }
          }
        })}
      </>
    )
  } catch (e) {
    console.log('parse error', e)
    return <>error</>
  }
}
