<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  hideCloseButton: {
    type: Boolean,
    default: false,
  },
  modalClass: {
    type: String,
    default: '',
  },
  modalContainerClass: {
    type: String,
    default: '',
  },
  keepMarkup: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:isOpen', 'modal-close'])

const modalContainer = ref<HTMLElement | null>(null)

function closeModal() {
  emit('update:isOpen', false)
  emit('modal-close')
}

function handleModalClick(e) {
  if (props.hideCloseButton) {
    return
  }

  if (
    modalContainer.value &&
    e.target !== modalContainer.value &&
    !modalContainer.value.contains(e.target)
  ) {
    closeModal()
  }
}

function handleModalKeydown(e) {
  if (props.hideCloseButton) {
    return
  }

  if (e.code === 'Escape' || e.keyCode === 27) {
    e.preventDefault()
    closeModal()
  }
}
</script>

<template>
  <transition name="v-transition-modal">
    <div v-if="isOpen || keepMarkup" class="modal-wrap">
      <transition name="v-transition-modal">
        <div
          v-show="isOpen || !keepMarkup"
          class="modal"
          tabindex="-1"
          role="dialog"
          :class="modalClass"
          @click="handleModalClick"
          @keydown="handleModalKeydown"
        >
          <button v-if="!hideCloseButton" class="modal__close" type="button">
            <span class="modal__close-icon">Close</span>
          </button>
          <div class="modal__wrap">
            <div ref="modalContainer" class="modal__container" :class="modalContainerClass">
              <slot />
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>
