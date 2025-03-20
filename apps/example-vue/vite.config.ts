/// <reference types='vitest' />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path'
import tailwind from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/example-vue',
  server: {
    port: 4200,
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'https://api-staging.pwn.xyz',
        changeOrigin: true,
      },
    },
  },
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()],
    },
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [
    vue(),
  ],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
