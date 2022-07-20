/// <reference types="vite-svg-loader" />

import { Store } from '@/store' // path to store file
import { LiteClient } from '@/ton-lite-client/src'

declare module 'qrcode.vue'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: Store
    $lc: LiteClient
    $ton: (value: number, round?: boolean) => string
  }
}
