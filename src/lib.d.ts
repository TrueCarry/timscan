/// <reference types="vite-svg-loader" />
/// <reference types="vite/client" />

import { Store } from '@/store' // path to store file
import { LiteClient } from '@/ton-lite-client/src'

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'qrcode.vue'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: Store
    $lc: LiteClient
    $ton: (value: number | null | undefined, round?: boolean) => string
  }
}
