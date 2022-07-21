import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import dotenv from 'dotenv'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { visualizer } from 'rollup-plugin-visualizer'
import svgLoader from 'vite-svg-loader'

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
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
  },
  optimizeDeps: {
    include: ['bn.js'],
  },
  define: {
    'process.env': {},
    // 'process.env': process.env,
  },
  rollupOptions: {
    // plugins: [
    //   visualizer()
    //   // nodePolyfills({crypto: true})
    // ],
  },
})
