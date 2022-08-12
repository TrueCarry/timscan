<script setup lang="ts">
import { IS_TESTNET } from '@/config'
import router from '@/router'
import { nextTick, ref } from 'vue'
import { matchAddress } from '../search'
import Logo from '@/assets/images/logo.svg'
import IconSearch from '@/assets/images/icon-search.svg'
import { useToast } from 'vue-toastification'

const toast = useToast()

const searchValue = ref<string>('')
const addressLoading = ref<boolean>(false)

async function doSearch() {
  addressLoading.value = true
  const match = await matchAddress(searchValue.value)
  addressLoading.value = false

  if (!match) {
    // Иначе сначала показывается алерт, а потом останавливается спиннер:
    return nextTick(() => toast('Invalid address format'))
  }

  router.push({
    name: 'address',
    params: { address: match },
  })

  reset()
}

function reset() {
  searchValue.value = ''
  // searchVisible.value = false
  // search.value?.blur()
}
</script>

<template>
  <header class="h-16 bg-foreground">
    <div class="container mx-auto flex items-center h-16">
      <router-link
        :to="{ name: 'index' }"
        class="flex items-center text-white hover:no-underline mr-4"
      >
        <Logo class="w-12 h-12" />

        <span v-if="IS_TESTNET" class="h-[18px]">TESTNET</span>
      </router-link>

      <!-- <div class="header-search-mobile" @click="searchVisible = true">
        <svg class="header-search-mobile__loopa" viewBox="0 0 24 24">
          <path
            d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
          ></path>
        </svg>
      </div> -->

      <div class="flex relative">
        <input
          ref="search"
          v-model.trim="searchValue"
          class="shadow bg-navy-800 py-2 px-4 rounded w-96 outline-none"
          type="search"
          spellcheck="false"
          enterkeyhint="search"
          autocomplete="off"
          tabindex="1"
          :placeholder="$t('header.search_placeholder')"
          @keyup.enter="doSearch()"
        />

        <div class="w-10 h-10 bg-navy-800 mx-2 rounded">
          <IconSearch class="w-6 h-6 mx-2 my-2 text-white fill-current" />
        </div>

        <!-- <svg
          v-show="addressLoading"
          class="header-search__loader"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 18 18"
        >
          <circle
            v-pre
            cx="9"
            cy="9"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            r="8"
            stroke-dasharray="34 12"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              repeatCount="indefinite"
              dur="1s"
              values="0 9 9;360 9 9"
              keyTimes="0;1"
            />
          </circle>
        </svg> -->
      </div>
    </div>
  </header>
</template>
