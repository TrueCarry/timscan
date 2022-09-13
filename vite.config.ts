import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { visualizer } from 'rollup-plugin-visualizer'
import svgLoader from 'vite-svg-loader'
import vueI18n from '@intlify/vite-plugin-vue-i18n'
import { chunkSplitPlugin } from 'vite-plugin-chunk-split'

dotenv.config()

// const builtinsPlugin = builtins({crypto: true});
// builtinsPlugin.name = 'builtins';

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    // splitVendorChunkPlugin(),
    vue(),
    vueJsx(),
    svgLoader(),
    visualizer(),
    vueI18n({
      include: resolve(dirname(fileURLToPath(import.meta.url)), './src/i18n/locales/**'),
    }),
    chunkSplitPlugin({
      customSplitting: {
        wasm: [/vm-exec.source.ts/],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '~': resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
  },
  optimizeDeps: {
    include: ['bn.js'],
  },
  define: {
    // 'process.env': {},
    // 'process.env': process.env,
  },
  // rollupOptions: {},
})
