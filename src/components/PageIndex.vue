<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { matchAddress } from '~/search'
import Logo from '@/assets/images/logo.svg'
import { useAddressStore } from '@/stores/address'
import RecentHistory from './index/RecentHistory.vue'

const router = useRouter()
const toast = useToast()
const addressStore = useAddressStore()

const search = ref<HTMLInputElement | null>(null)
const searchVisible = ref<boolean>(false)
const searchValue = ref<string>('')
const addressLoading = ref<boolean>(false)

onMounted(() => {
  search.value?.focus()
})

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
  searchVisible.value = false
  search.value?.blur()
}

function handleBlur() {
  if (!searchValue.value || searchValue.value.length === 0) {
    searchVisible.value = false
  }
}

addressStore.loadHistory()
</script>

<template>
  <section class="container mx-auto items-center justify-center flex flex-col pt-32">
    <Logo class="w-32 h-32" />
    <div class="mt-8 px-4 md:px-0 w-full md:w-[40rem] justify-center items-center flex flex-col">
      <input
        ref="search"
        v-model.trim="searchValue"
        type="search"
        class="shadow bg-navy-800 text-white py-2 px-4 rounded w-full outline-none"
        enterkeyhint="search"
        spellcheck="false"
        autocomplete="off"
        :placeholder="$t('indexpage.search_placeholder')"
        @keyup.enter="doSearch()"
        @keyup.esc="reset()"
      />

      <!-- <svg
        v-show="addressLoading"
        class="w-4 h-4"
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

    <RecentHistory />
  </section>
</template>
