<template>
  <div id="root" ref="root"></div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as monaco from 'monaco-editor'
// import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
// import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// self.MonacoEnvironment = {
//   getWorker(_: string, label: string) {
//     if (['typescript', 'javascript'].includes(label)) {
//       return new TsWorker()
//     }
//     return new EditorWorker()
//   },
// }

const root = ref<HTMLElement>()
const props = defineProps({
  modelValue: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue'])

let editor: monaco.editor.IStandaloneCodeEditor

onMounted(() => {
  editor = monaco.editor.create(root.value as HTMLElement, {
    language: '',
    value: props.modelValue,
  })

  editor.onDidChangeModelContent((event) => {
    const value = editor.getValue()
    if (props.modelValue !== value) {
      emit('update:modelValue', value, event)
    }
  })
})
onUnmounted(() => {
  editor.dispose()
})
</script>

<style scoped></style>
