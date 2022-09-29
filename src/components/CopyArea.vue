<script setup lang="ts">
const props = defineProps({
  value: { type: String, required: true },
})
console.log('render', props.value)
</script>

<template>
  <textarea
    class="outline-none break-words w-full p-2 rounded break-all bg-navy-800 whitespace-pre"
    rows="3"
    :value="value"
  />
</template>
