import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@d-form/vue': path.resolve(__dirname, '../../packages/vue/src/index.ts'),
      '@d-form/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
      '@d-form/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
      '@d-form/element-plus': path.resolve(__dirname, '../../packages/element-plus/src/index.ts'),
    },
  },
  server: { port: 5173 },
})
