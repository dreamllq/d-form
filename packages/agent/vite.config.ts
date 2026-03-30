import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'DFormAgent',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['@d-form/shared', '@d-form/element-plus', 'zod'],
      output: {
        exports: 'named',
        globals: {
          zod: 'Zod',
        },
      },
    },
    outDir: 'dist',
    sourcemap: true,
    minify: false,
  },
})
