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
      <div flex="flex flex-col">
        {info.content?.map((out) => {
          switch (out.type) {
            case 'int': {
              return (
                <div class="flex flex-col">
                  <div className="text-secondary">
                    {out.name}({out.type})
                  </div>
                  <div> {slice.readInt(out.length || slice.remaining).toString()} </div>
                </div>
              )
            }
            case 'uint': {
              return (
                <div class="flex flex-col">
                  <div className="text-secondary">
                    {out.name}({out.type})
                  </div>
                  <div>{slice.readUint(out.length || slice.remaining).toString()} </div>
                </div>
              )
            }
            case 'cell': {
              return (
                <div class="flex flex-col">
                  <div className="text-secondary">
                    {out.name}({out.type})
                  </div>
                  <div>
                    (
                    <ValueCellWrapper
                      info={{
                        ...toRaw(out),
                        value: slice.readRef(),
                      }}
                      class="ml-4"
                    />
                    )
                  </div>
                </div>
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
                <div class="flex flex-col">
                  <div className="text-secondary">
                    {out.name}({out.type})
                  </div>
                  <div>{slice.readAddress()?.toFriendly({ bounceable: true, urlSafe: true })}</div>
                </div>
              )
            }
            case 'slice': {
              return (
                <div class="flex flex-col">
                  <div className="text-secondary">
                    {out.name}({out.type})
                  </div>
                  <div>{slice.readRemainingBytes().toString()}</div>
                </div>
              )
            }
            default: {
              return (
                <div class="flex flex-col">
                  <div className="text-secondary">Default({out.type})</div>
                  <div>{JSON.stringify(slice.readRemainingBytes().toString())}</div>
                </div>
              )
            }
          }
        })}
      </div>
    )
  } catch (e) {
    console.log('parse error', e)
    return <>error</>
  }
}
