import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'DFormVue',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue', '@d-form/core', '@d-form/shared'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
      },
    },
    outDir: 'dist',
    sourcemap: true,
    minify: false,
  },
})
