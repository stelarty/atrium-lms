import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'prototype' ? './' : '/',
  plugins: [
    vue(),
    // vueDevTools(),
  ],
  build: {
    // Default 4kb: small UI PNGs stay as separate requests and load on first <img> mount.
    // Inline into JS so illustrations appear with the chunk (no second network round-trip).
    assetsInlineLimit: 51200,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/imports.scss";`,
      },
    },
  },
}))
