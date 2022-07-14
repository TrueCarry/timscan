import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import dotenv from 'dotenv'
// import builtins from 'rollup-plugin-node-builtins';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import vueJsx from '@vitejs/plugin-vue-jsx'



dotenv.config()

// const builtinsPlugin = builtins({crypto: true});
// builtinsPlugin.name = 'builtins';

export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~': path.resolve(__dirname, './src/js'),
    },
  },
  build: {
    target: 'es2020',
  },
  optimizeDeps: {
    include: ['bn.js'],
  },
  define: {
    'process.env': process.env
  },
  rollupOptions: {
    plugins: [nodePolyfills({crypto: true})],
},

})