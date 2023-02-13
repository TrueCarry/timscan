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

    value?: unknown
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
    const slice =
      info.value instanceof Cell ? (toRaw(info.value) as Cell).beginParse() : (info.value as Slice)

    return (
      <div flex="flex flex-col">
        {info.content?.map((out) => {
          return (
            <div class="flex flex-col">
              <div className="text-secondary">
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
  switch (out.type) {
    case 'int': {
      return <div> {slice.readInt(out.length || slice.remaining).toString()} </div>
    }
    case 'uint': {
      return <div>{slice.readUint(out.length || slice.remaining).toString()} </div>
    }
    case 'cell': {
      return (
        <div>
          <ValueCellWrapper
            info={{
              ...toRaw(out),
              value: slice.readRef(),
            }}
            class={['pl-4', 'border-l', `border-${colorsList[colorsList.length % level]}-500`]}
            level={level + 1}
          />
        </div>
      )
    }
    case 'address': {
      return <div>{slice.readAddress()?.toFriendly({ bounceable: true, urlSafe: true })}</div>
    }
    case 'slice': {
      return <div>{slice.readRemainingBytes().toString()}</div>
    }
    default: {
      return <div>{JSON.stringify(slice.readRemainingBytes().toString())}</div>
    }
  }
}
