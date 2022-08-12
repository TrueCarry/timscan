<template>
  <section>
    <!-- <section v-if="wallet.invalid">
            <div class="alert" v-text="$t('error.invalid_address')"/>
        </section> -->

    <section class="mx-4 mt-4 gap-4 flex flex-col lg:container lg:mx-auto lg:flex-row">
      <div class="flex flex-col bg-foreground shadow rounded p-4 h-min lg:w-1/3 lg:sticky top-4">
        <div class="flex flex-col py-2">
          <div class="flex text-secondary" v-text="$t('address.info.address')" />
          <div class="flex items-center cursor-pointer text-xs">
            <!-- <span
              v-if="addressMeta.isScam"
              class="card-main-address-badge card-main-address-badge--scam"
              >SCAM</span
            > -->
            <ui-copy-button
              show-button
              class="card-main-address flex items-center"
              :success-message="$t('address.info.copy_success')"
              :copy="address"
            >
              {{ address }}
            </ui-copy-button>

            <span class="mx-2 p-0 hover:text-white" @click.prevent="qrModalVisible = true">
              <svg
                v-pre
                class="card-main-qr-button__icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 14 14"
              >
                <path
                  d="M0 0v6h6V0H0zm8 0v6h6V0H8zM2 2h2v2H2V2zm8 0h2v2h-2V2zM0 8v6h6V8H0zm8 0v2h2V8H8zm2 2v2h2v-2h-2zm2 0h2V8h-2v2zm0 2v2h2v-2h-2zm-2 0H8v2h2v-2zm-8-2h2v2H2v-2z"
                />
              </svg>
            </span>
          </div>
        </div>

        <div class="flex flex-col py-2">
          <div class="flex text-secondary" v-text="$t('address.info.balance')" />
          <div v-if="balance" class="flex">
            {{ $ton(parseInt(balance)) }}
            <span title="TON" v-text="'TON'" />
            <!-- <span v-if="$store.state.exchangeRate" style="color: #717579">
                            ≈ ${{$fiat(wallet.balance * $store.state.exchangeRate)}}
                        </span> -->
          </div>
          <div v-else class="flex">
            <span class="skeleton">00000 TON ≈ 00000 USD</span>
          </div>
        </div>

        <div class="flex flex-col py-2">
          <div class="flex text-secondary" v-text="$t('address.info.last_activity')" />
          <div class="flex">
            <!-- <span v-if="lastActivity === undefined" class="skeleton">99 minutes ago</span> -->
            <span v-if="!lastTxTime" v-text="$t('address.info.no_activity')" />
            <ui-timeago v-else :timestamp="lastTxTime * 1000 || 0" />
          </div>
        </div>

        <div class="flex flex-col py-2">
          <div class="flex text-secondary" v-text="$t('address.info.state')" />
          <div class="flex">
            <span
              v-if="wallet?.state?.type === 'frozen'"
              class="flex-wallet-activity flex-wallet-activity--frozen"
              v-text="$t('address.info.type_frozen')"
            />

            <span
              v-else-if="wallet?.state.type === 'active'"
              class="flex-wallet-activity flex-wallet-activity--active"
              v-text="$t('address.info.type_active')"
            />

            <span
              v-else
              class="flex-wallet-activity flex-wallet-activity--passive"
              v-text="$t('address.info.type_inactive')"
            />
          </div>
        </div>

        <div class="flex flex-col py-2">
          <div class="flex text-secondary" v-text="$t('address.info.contract_type')" />

          <div class="flex">
            <!-- <router-link
                            v-if="contractExtendedInfo.type === 'collection'"
                            v-bind:to="{ name: 'nft', params: { address, skeletonHint: 'collection' }}"
                            v-text="'NFT Collection'"/>

                        <router-link
                            v-else-if="contractExtendedInfo.type === 'nft_item'"
                            v-bind:to="{ name: 'nft', params: { address, skeletonHint: 'item' }}"
                            v-text="'NFT Item'"/> -->

            <span>{{ addressStore.abi?.name || 'Unknown' }}</span>
          </div>
        </div>

        <div class="flex flex-col py-2">
          <div class="flex text-secondary" v-text="$t('address.info.last_update')" />
          <div class="flex items-center cursor-pointer" @click="loadData(true, false)">
            <ui-timeago :timestamp="wallet?.lastUpdated || 0" />
            <span>
              <IconRefresh class="w-4 text-white fill-current ml-1" />
            </span>
          </div>
        </div>
      </div>

      <div class="flex flex-col mb-8 lg:w-2/3">
        <nav class="flex bg-foreground shadow rounded p-4 gap-4">
          <div
            class="flex cursor-pointer gap-2 p-2 rounded"
            :class="selectedTab === 'transactions' && 'bg-navy-700'"
            @click="selectTab('transactions')"
          >
            <IconTransactions class="w-6 h-6 fill-current" />
            Transactions
          </div>
          <div
            class="flex cursor-pointer gap-2 p-2 rounded"
            :class="selectedTab === 'contract' && 'bg-navy-700'"
            @click="selectTab('contract')"
          >
            <IconContract class="w-6 h-6 fill-current" />

            Contract
          </div>
        </nav>

        <template v-if="selectedTab === 'transactions' && wallet">
          <TransactionsList :wallet="wallet" :wallet-address="wallet.address" class="mt-4" />
        </template>
        <template v-else-if="selectedTab === 'contract'">
          <ContractInfo class="" />
        </template>

        <!-- <mugen-scroll v-bind:handler="loadMore" v-bind:should-handle="shouldHandleScroll" style="display: flex;">
                    <div v-on:click="loadMore" class="tx-table-loader-button" v-show="showPreloader">
                        <span v-if="isLoading" v-text="$t('address.tx_table.loader_loading')"/>
                        <span v-else v-text="$t('address.tx_table.loader')"/>
                    </div>
                </mugen-scroll> -->
      </div>
    </section>

    <ui-modal class="qr-modal" :is-open="qrModalVisible" @modal-close="qrModalVisible = false">
      <section class="ui-qr w-[312px] h-[312px]">
        <qr-code
          class=""
          level="H"
          render-as="svg"
          foreground="#111"
          :value="`ton://transfer/${address}`"
          :size="300"
        />

        <svg
          v-pre
          class="ui-qr__logo ui-qr__logo--cat"
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          <path
            d="M46.54 19.143c.608.424.92 2.325.605 6.494a42.027 42.027 0 0 1-.606 4.514c1.411 2.459 1.8 5.247 1.167 8.366-.561 2.761-2.398 5.341-5.345 7.805C39.413 48.787 35.995 51 31.969 51c-4.027 0-8.154-2.323-10.66-4.678-2.507-2.354-4.084-4.575-4.813-7.047-.883-2.997-.587-6.038.886-9.124-.313-1.654-.51-3.158-.59-4.514-.296-4.994-.106-5.965.59-6.494.947-.72 3.961 1.13 9.042 5.547 2.327-.421 4.186-.631 5.576-.631 1.39 0 3.228.21 5.513.63 5.114-4.326 8.123-6.175 9.026-5.546Z"
            stroke="currentColor"
            stroke-width="6"
          />
          <path
            d="M31.932 43.822c-1.234.024-2.896-1.649-2.896-2.333 0-.685 1.948-.888 3.037-.888 1.09 0 2.897.116 2.897.888 0 .771-1.804 2.309-3.038 2.333ZM23.985 37.338c1.785.695 3.59.315 4.03-.85.44-1.165-.65-2.674-2.435-3.37-1.784-.695-3.305-.775-3.746.39-.44 1.165.367 3.134 2.151 3.83ZM39.96 37.137c-1.687.815-3.525.516-3.965-.65-.44-1.164.65-2.673 2.434-3.369 1.785-.695 3.127-.775 3.567.39.44 1.165-.349 2.813-2.036 3.629Z"
            fill="currentColor"
          />
        </svg>
      </section>
    </ui-modal>
  </section>
</template>

<script lang="ts" setup>
import QrCode from 'qrcode.vue'
// import MugenScroll from 'vue-mugen-scroll';

import ContractInfo from './ContractInfo.vue'
import { ref, computed, watch, inject } from 'vue'
import { LiteClient } from 'ton-lite-client'
import TransactionsList from './TransactionsList.vue'
import IconRefresh from '@/assets/images/icon-refresh.svg?component'
import { Transaction } from '@/models/Transaction'
import { Address } from '@/ton/src'
import { useAddressStore } from '@/stores/address'

import IconContract from '@/assets/images/icon-contract.svg'
import IconTransactions from '@/assets/images/icon-transactions.svg'

const addressStore = useAddressStore()

const props = defineProps({
  address: {
    type: String,
    required: true,
  },
})

const lastTxTime = computed(() => addressStore.transactions[0]?.time)

const wallet = computed(() => addressStore.wallet)

const contractTypeVisible = ref<boolean>(true)
// const wallet = ref<AccountPlainState | null>(null)
const transactions = ref<Transaction[]>([])
// const lastActivity = ref<number | null>(null)
const isLoading = ref<boolean>(true)
const hasMore = ref<boolean>(true)
const emptyHistory = ref<boolean>(false)
const qrModalVisible = ref<boolean>(false)
const contractExtendedInfo = ref<unknown | undefined>(undefined)

// const parsedAddress = computed(() => Address.parse(props.address))

const selectedTab = ref<'transactions' | 'contract'>(
  window.location.hash.slice(1) === 'contract' ? 'contract' : 'transactions'
)

const addressMeta = computed(() => {
  return {} // store.getters.getAddressMeta(props.address)
})

const shouldHandleScroll = computed(() => {
  return !isLoading.value && hasMore.value && transactions.value.length > 0
})

const showPreloader = computed(() => {
  return transactions.value.length > 0 && hasMore.value
})

const balance = computed(() => {
  console.log('Balance change', wallet.value?.balance?.coins)
  return wallet.value && wallet?.value?.balance?.coins
})

const loadData = async (forceUpdate?: boolean, reset?: boolean) => {
  addressStore.loadData({ address: props.address, forceUpdate, reset })
}

watch(
  () => props.address,
  () => {
    loadData(false, true)
  }
)

loadData(false, true)

const selectTab = (tab: 'transactions' | 'contract') => {
  selectedTab.value = tab
  window.location.hash = tab
}
</script>
