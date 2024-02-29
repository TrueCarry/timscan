import BN from 'bn.js'
import { Cell, Slice } from 'ton-core'
import { defineComponent, toRaw } from 'vue'
import { OutputArg, CellContent } from '../../abi'

export default defineComponent({
  name: 'ValueCellWrapper',
  props: {
    info: {
      type: Object,
      required: true,
    },
    level: {
      type: Number,
      required: false,
      default: 1,
    },
  },

  render: ValueCellWrapper,
})

const colorsList = ['navy', 'indigo', 'pink', 'gold', 'green']

function ValueCellWrapper({
  info,
  level,
}: {
  info: {
    name: string
    type: string

    length?: number

    value?: {
      cell: Cell
    }
    content?: CellContent[]
  }
  level: number
}) {
  if (!info) {
    return <></>
  }

  if (!info.value) {
    return <></>
  }

  try {
    console.log('info?', info.value)
    const slice = info.value.cell.asSlice()
    // info.value instanceof Cell ? (toRaw(info.value) as Cell).beginParse() : (info.value as Slice)

    return (
      <div class="flex flex-col">
        {info.content?.map((out) => {
          return (
            <div class="flex flex-col">
              <div class="text-secondary">
                {out.name} ({out.type})
              </div>

              {RenderValue(out, slice, level)}
            </div>
          )
        })}
      </div>
    )
  } catch (e) {
    console.log('parse error', e)
    return <div>error</div>
  }
}

function RenderValue(out: CellContent, slice: Slice, level: number) {
  // console.log('slice', slice)
  switch (out.type) {
    case 'int': {
      return <div> {slice.loadInt(out.length || slice.remainingBits).toString()} </div>
    }
    case 'uint': {
      return <div>{slice.loadUint(out.length || slice.remainingBits).toString()} </div>
    }
    case 'cell': {
      return (
        <div>
          <ValueCellWrapper
            info={{
              ...toRaw(out),
              value: {
                cell: slice.loadRef(),
              },
            }}
            // class={`pl-4 border-l border-${colorsList[colorsList.length % level]}-500`}
            level={level + 1}
          />
        </div>
      )
    }
    case 'address': {
      return <div>{slice.loadMaybeAddress()?.toString({ bounceable: true, urlSafe: true })}</div>
    }
    case 'slice': {
      return <div>{slice.loadBuffer(slice.remainingBits / 8).toString()}</div>
    }
    default: {
      return <div>{JSON.stringify(slice.loadBuffer(slice.remainingBits / 8).toString())}</div>
    }
  }
}
