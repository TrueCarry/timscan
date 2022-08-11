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
  <component
    :is="disabled ? 'span' : 'router-link'"
    class="flex whitespace-nowrap"
    :class="[!disabled && 'text-blue-500']"
    :to="{ name: 'address', params: { address } }"
  >
    <span class="overflow-ellipsis overflow-hidden whitespace-nowrap">
      {{ name.substring(0, 40) }}
    </span>
    <span class="">
      {{ name.substring(40) }}
    </span>
  </component>
  <!-- <span v-else class="link" :data-loopa="name.slice(0, 40)" :data-poopa="name.slice(40)" /> -->
  <!-- <span v-else class="flex whitespace-nowrap">
    <span class="overflow-ellipsis overflow-hidden">
      {{ name.substring(0, 44) }}
    </span>
    <span class="">
      {{ name.substring(44) }}
    </span>
  </span> -->
</template>

<style lang="scss" scoped>
.link {
  font-feature-settings: 'tnum';
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  max-width: 100%;
  min-width: 0;
  white-space: nowrap;

  &::before {
    content: attr(data-loopa);
    flex-grow: 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &::after {
    content: attr(data-poopa);
    flex-shrink: 0;
  }
}
</style>
