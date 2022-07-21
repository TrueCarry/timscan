import { createApp, provide } from 'vue'
import axios from 'axios'
// import VueClipboard from 'vue-clipboard2';
import store from './store'
import router from './router'
import App from '~/components/App.vue'
import UiCopyButton from '~/components/UiCopyButton.vue'
import UiAddress from '~/components/UiAddress.vue'
import UiTimeago from '~/components/UiTimeago.vue'
import UiModal from '~/components/UiModal.vue'
// import { IS_TESTNET } from '~/config.js'
import { formatFee, formatTons, formatFiat } from '~/helpers'
import i18n from '~/i18n'
import './sass/app.scss'
import { LiteClient, LiteRoundRobinEngine, LiteSingleEngine } from '@/ton-lite-client/src/index'
import liteClient, { initLiteClient } from './liteClient'
import AppDb from './db'

const db = new AppDb()
db.open()

// Vue.use(VueClipboard);

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

app.use(i18n)
app.use(router)
app.use(store)

app.provide('$lc', liteClient)
initLiteClient()

app.component('UiCopyButton', UiCopyButton)
app.component('UiAddress', UiAddress)
app.component('UiTimeago', UiTimeago)
app.component('UiModal', UiModal)

app.config.globalProperties.$ton = formatTons
app.config.globalProperties.$fee = formatFee
app.config.globalProperties.$fiat = formatFiat

app.mount('#app')
