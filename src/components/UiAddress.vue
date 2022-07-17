<script setup lang="ts">
import { useStore } from 'vuex'

const props = defineProps({
  address: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const store = useStore()
const name = store.getters.getAddressName(props.address)
</script>

<template>
  <router-link
    v-if="!disabled"
    class="address-link ui-looong clickable"
    :to="{ name: 'address', params: { address } }"
    :data-loopa="name.substr(0, 40)"
    :data-poopa="name.substr(40)"
  />
  <span
    v-else
    class="address-link ui-looong"
    :data-loopa="name.substr(0, 40)"
    :data-poopa="name.substr(40)"
  />
</template>
