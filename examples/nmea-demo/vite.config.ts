import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig(({ command }) => ({
  plugins: [preact()],
  base: '/',
  build: {
    sourcemap: true,
    commonjsOptions: {
      include: [/@jbroll\/nmea-widgets/, /node_modules/]
    }
  },
  optimizeDeps: {
    include: ['preact', 'preact/hooks', '@jbroll/nmea-widgets']
  }
}))
