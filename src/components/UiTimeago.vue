<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { format } from 'timeago.js'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const props = defineProps({
  timestamp: {
    required: true,
    type: Number,
  },
})

const timeAgoText = ref(
  format(props.timestamp, locale.value, {
    minInterval: 5,
  })
)

watchEffect(async (onCleanup) => {
  timeAgoText.value = format(props.timestamp, locale.value, {
    minInterval: 5,
  })
  if (Date.now() - props.timestamp > 864000) {
    return
  }

  const int = setInterval(() => {
    timeAgoText.value = format(props.timestamp, locale.value, {
      minInterval: 5,
    })
  }, 5000)
  onCleanup(() => {
    clearInterval(int)
  })
})
</script>

<template>
  <span :datetime="timestamp" v-text="timeAgoText" />
</template>
