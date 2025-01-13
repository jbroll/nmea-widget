import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    preact(),
    dts({
      insertTypesEntry: true,
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'NMEAWidgets',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: [
        'preact',
        'preact/hooks',
        'preact/jsx-runtime',
        'tailwindcss'
      ],
      output: {
        globals: {
          preact: 'Preact',
          'preact/hooks': 'PreactHooks',
          'preact/jsx-runtime': 'PreactJSXRuntime',
          tailwindcss: 'Tailwindcss'
        }
      }
    }
  }
});