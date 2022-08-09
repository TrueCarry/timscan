<script setup lang="ts">
import { computed } from 'vue'
// import { useStore } from 'vuex'

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

// const store = useStore()
const name = computed(() => props.address)
// store.getters.getAddressName(props.address)
</script>

<template>
  <router-link
    v-if="!disabled"
    class="address-link ui-looong clickable"
    :to="{ name: 'address', params: { address } }"
    :data-loopa="name.substr(0, 40)"
    :data-poopa="name.substr(40)"
  />
  <span v-else class="flex">
    <span class="overflow-ellipsis overflow-hidden whitespace-nowrap">
      {{ name.substring(0, 44) }}
    </span>
    <span class="">
      {{ name.substring(44) }}
    </span>
  </span>
</template>
