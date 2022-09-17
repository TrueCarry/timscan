<script setup lang="ts">
import { CompileResult, funcCompile } from '@ton.org/func-js'

import { ref, h, onMounted, watch } from 'vue'
import MonacoEditor from './MonacoEditor.vue'
import CompiledResult from '../FuncCompiler/CompiledResult.vue'
import MethodCaller from '../FuncCompiler/MethodCaller.vue'
// import MonacoEditor from 'vue-monaco'

// MonacoEditor.render = () => h('div')

const files = ref<{ name: string; content: string }[]>([])
const result = ref<CompileResult | null>(null)
const entrypoints = ref<{ index: number; enabled: boolean }[]>([])
const selectedFile = ref(0)

function onInput(key: number) {
  console.log('on input key', key)
  return (e) => {
    files.value[key].name = e.target.value
    // console.log('input', e.target.value, files.value[key])
    // files.value[e.target.value] = files.value[key]
    // delete files.value[key]
  }
}

watch(
  () => files.value.length,
  (newVal, oldVal) => {
    console.log('old', oldVal, newVal)
    if (newVal > oldVal) {
      entrypoints.value.push({ index: newVal - 1, enabled: true })
    }
    // if (files.value.length !== entrypoints.value.length) {
    // entrypoints.value = files.value.map((f, i) => ({ index: i, enabled: true }))
    // }
  }
)

const addFile = (editorContent?: string) => {
  files.value.push({ name: `new file.fc`, content: editorContent || '' })
  console.log('f', files.value)
  selectedFile.value = files.value.length - 1
}

onMounted(() => addFile('int main(int a, int b) { return a + b; }'))

async function compile() {
  const compileRes = await funcCompile({
    entryPoints: entrypoints.value.filter((e) => e.enabled).map((e) => files.value[e.index].name),
    optLevel: 1,
    sources: files.value.reduce((total, current) => {
      total[current.name] = current.content
      return total
    }, {}),
  })
  console.log('files', files.value)

  console.log('compile', compileRes)
  result.value = compileRes
  // if (compileRes.status === 'ok') {
  //   result.value = compileRes.fiftCode
  // } else {
  //   result.value = compileRes.message
  // }
}

function moveUp(i: number) {
  const j = i - 1
  ;[entrypoints.value[i], entrypoints.value[j]] = [entrypoints.value[j], entrypoints.value[i]]
}
function moveDown(i: number) {
  const j = i + 1
  ;[entrypoints.value[i], entrypoints.value[j]] = [entrypoints.value[j], entrypoints.value[i]]
}
</script>

<template>
  <section class="mx-4 mt-4 gap-4 flex flex-col lg:container lg:mx-auto lg:flex-row">
    <div class="flex flex-col h-min lg:w-2/3 lg:sticky top-4">
      <div class="bg-foreground shadow rounded p-4">
        <button
          class="rounded bg-blue-700 px-4 text-lg font-bold h-8 w-32 mb-4 ml-auto"
          @click="compile"
        >
          Compile
        </button>
        <!-- Compiler -->

        <!-- <button @click="entrypoints.push('')">Add Entrypoint</button> -->

        <!-- <MonacoEditor v-model="code" class="h-32" language="javascript" /> -->

        <div>
          <div className="flex flex-wrap">
            <div
              v-for="(file, key) in files"
              :key="key"
              class="h-8"
              @click="() => (selectedFile = key)"
            >
              <input
                class="px-2 h-8 outline-none"
                :class="selectedFile === key ? 'bg-navy-800 text-white' : 'text-black'"
                type="text"
                :value="file.name"
                @input="(e) => onInput(key)(e)"
              />

              <!-- <textarea
            id=""
            v-model="file.content"
            class="text-black"
            name=""
            cols="30"
            rows="10"
          ></textarea> -->
              <!-- {{ key }} : {{ file }} -->
            </div>

            <button class="rounded bg-blue-700 px-4 text-lg font-bold h-8" @click="() => addFile()">
              +
            </button>
          </div>
          <MonacoEditor
            v-if="files[selectedFile]"
            :key="selectedFile"
            v-model="files[selectedFile].content"
            class="h-[600px]"
            language="javascript"
          />
        </div>

        <div>
          Entrypoints:
          <div class="flex flex-col gap-2 select-none">
            <div
              v-for="(entrypoint, i) in entrypoints"
              :key="i"
              class="flex gap-2"
              :class="!entrypoint.enabled && 'text-gray-500'"
            >
              <div>Name: {{ files[entrypoint.index].name }}</div>
              <!-- <div class="w-16">Enabled: {{ entrypoint.enabled ? '+' : '-' }}</div> -->
              <div
                class="w-12 cursor-pointer"
                @click="
                  () => {
                    entrypoints[i].enabled = !entrypoint.enabled
                  }
                "
              >
                {{ !entrypoint.enabled ? 'Enable' : 'Disable' }}
              </div>

              <div v-if="i > 0" class="w-16 cursor-pointer" @click="moveUp(i)">Move up</div>
              <div v-else class="w-16 cursor-pointer"></div>

              <div v-if="i < entrypoints.length - 1" class="cursor-pointer" @click="moveDown(i)">
                Move down
              </div>
            </div>
            <!-- <input
            v-for="(entrypoint, i) in entrypoints"
            :key="i"
            class="text-black"
            :value="entrypoint"
            type="text"
            @input="(e) => (entrypoints[i] = e.target.value)"
          /> -->
          </div>
        </div>
      </div>

      <MethodCaller class="mt-4" :result="result" />
    </div>

    <div class="flex flex-col gap-2 lg:w-1/3">
      <CompiledResult :result="result" />
    </div>
  </section>
</template>
