import { createApp, provide } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'

import store from './store'
import router from './router'
import App from '~/components/App.vue'
import UiCopyButton from '~/components/UiCopyButton.vue'
import UiAddress from '~/components/UiAddress.vue'
import UiTimeago from '~/components/UiTimeago.vue'
import UiModal from '~/components/UiModal.vue'

import { formatFee, formatTons, formatFiat } from '~/helpers'
import i18n from '~/i18n'
import './sass/app.scss'

import liteClient, { initLiteClient } from './liteClient'
import AppDb from './db'

import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

import VueModal from '@kouts/vue-modal'
import '@kouts/vue-modal/dist/vue-modal.css'
import { initSqlite } from './sqlite'

const db = new AppDb()
db.open()

const pinia = createPinia()

initSqlite()

// Vue.use(VueClipboard)

// Vue.prototype.$http = axios;
// Vue.prototype.$bus = new Vue();

// Vue.prototype.$ton = formatTons;
// Vue.prototype.$fee = formatFee;
// Vue.prototype.$fiat = formatFiat;

// new Vue({ router, store, i18n,
//     el: '#app',
//     render: h => h(App),
//     created() {
//         if (IS_TESTNET) {
//             return console.debug('Not loading addressbook and exchange rates in testnet mode');
//         }

//         this.$store.dispatch('getAddrbook');
//         this.$store.dispatch('getExchangeRates');
//     },
// });

const app = createApp(App)

app.use(pinia)
app.use(i18n)
app.use(router)
app.use(Toast, {
  timeout: 3000,
})

// app.use(store)
// app.use(VueClipboard)

app.provide('$lc', liteClient)
initLiteClient()

app.component('UiCopyButton', UiCopyButton)
app.component('UiAddress', UiAddress)
app.component('UiTimeago', UiTimeago)
app.component('UiModal', UiModal)
// eslint-disable-next-line vue/multi-word-component-names
app.component('Modal', VueModal)

app.config.globalProperties.$ton = formatTons
app.config.globalProperties.$fee = formatFee
app.config.globalProperties.$fiat = formatFiat

app.mount('#app')
