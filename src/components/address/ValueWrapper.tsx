import BN from 'bn.js'
import { Cell, Slice } from '@/ton/src'
import { defineComponent, toRaw } from 'vue'

export default defineComponent({
  props: {
    info: {
      type: Object,
      required: true,
    },
  },

  render({
    info,
  }: {
    info: {
      name: string
      type: string

      length?: number

      value?: unknown
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
      default:
        return <div>{JSON.stringify(info)}</div>
    }
  },
})
