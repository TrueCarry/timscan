<script setup lang="ts">
import { ref } from 'vue'

// const timerHandle = undefined

const message = ref('')
const visible = ref(false)

// export default {
//   data() {
//     return {
//       message: undefined,
//       visible: false,
//     }
//   },

//   created() {
//     // this.$bus.$on('showToast', (message) => {
//     //     this.message = message;
//     //     this.visible = true;
//     //     clearTimeout(timerHandle);
//     //     timerHandle = setTimeout(() => this.visible = false, 2000);
//     // });
//   },

//   beforeUnmount() {
//     // this.$bus.$off('showToast');
//   },
// }
</script>

<template>
  <div class="toast-container">
    <div class="toast" :class="{ visible }" v-text="message" />
  </div>
</template>
