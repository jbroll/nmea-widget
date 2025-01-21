import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

const BASE_PATH = '/nmea-widgets/'

export default defineConfig(({ command }) => ({
  plugins: [preact()],
  base: command === 'serve' ? '/' : BASE_PATH,
  build: {
    sourcemap: true
  },
  resolve: {
    dedupe: ['preact', 'preact/hooks', 'preact/jsx-runtime']
  },
  server: {
    port: 3000
  },
  preview: {
    port: 3000
  }
}))

