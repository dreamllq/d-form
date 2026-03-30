import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'DFormSchemaEditor',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'vue',
        '@d-form/vue',
        '@d-form/core',
        '@d-form/shared',
        '@guolao/vue-monaco-editor',
        'monaco-editor',
      ],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true,
    minify: false,
  },
})
