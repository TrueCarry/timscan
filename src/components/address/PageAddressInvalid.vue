<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { matchAddress } from '~/search'

const props = defineProps({
  address: {
    type: String,
    required: true,
  },
})

const router = useRouter()

const isInvalid = ref(false)

onMounted(async () => {
  const match = await matchAddress(props.address)

  if (!match) {
    isInvalid.value = true
    return
  }

  router.replace({
    name: 'address',
    params: { address: match },
  })
})
</script>

<template>
  <section>
    <section v-if="isInvalid">
      <div class="alert" v-text="$t('error.invalid_address')" />
    </section>
  </section>
</template>
