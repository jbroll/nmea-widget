import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig(({ command, mode }) => ({
  plugins: [
    preact({
      debug: mode !== 'production'
    }),
    dts({
      insertTypesEntry: true,
    })
  ],
  define: {
    __DEV__: JSON.stringify(command === 'serve' || mode === 'development'),
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'NMEAWidgets',
      fileName: 'index',
      formats: ['es']
    },
    sourcemap: true,
    minify: mode === 'production',
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
}));