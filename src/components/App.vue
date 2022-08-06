<template>
  <section>
    <AppHeader />
    <div class="content">
      <router-view />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { matchAddress } from '../search'
import { useRouter } from 'vue-router'
import { IS_TESTNET } from '@/config'
import AppHeader from './AppHeader.vue'
import { useToast } from 'vue-toastification'

const toast = useToast()
const router = useRouter()

const search = ref<HTMLInputElement | null>(null)
const searchVisible = ref<boolean>(false)
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
  searchVisible.value = false
  search.value?.blur()
}

function handleBlur() {
  if (!searchValue.value || searchValue.value.length === 0) {
    searchVisible.value = false
  }
}
</script>
