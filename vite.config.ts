import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { visualizer } from 'rollup-plugin-visualizer'
import svgLoader from 'vite-svg-loader'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
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
    VueI18nPlugin({
      include: [resolve(__dirname, './src/i18n/locales/**')],
    }),

    chunkSplitPlugin({
      strategy: 'all-in-one',
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
    esbuildOptions: {
      target: 'esnext',
    },
  },
  define: {
    // 'process.env': {},
    // 'process.env': process.env,
  },
  // rollupOptions: {},
})
