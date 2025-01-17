import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig(({ command, mode }) => ({
  plugins: [preact()],
  base: command === 'serve' ? '/' : '/nmea-widgets/',
  define: {
    __DEV__: JSON.stringify(command === 'serve' || mode === 'development'),
  },
  build: {
    sourcemap: true,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      }
    }
  },
  optimizeDeps: {
    include: ['preact', 'preact/hooks', 'preact/jsx-runtime'],
    esbuildOptions: {
      sourcemap: true
    }
  }
}));
