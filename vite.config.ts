import { resolve } from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'books-ui',
      // Se agregará la extension apropiada.
      fileName: 'books-ui'
    },
    rollupOptions: {
      // Asegúrate de externalizar las dependencias que no deberían estar empaquetadas
      // en tu librería
      external: ['react', 'react-dom', 'framer-motion'],
      output: {
        // Proporciona variables globales para usar en la compilación UMD
        // para dependencias externalizadas
        globals: {
          react: 'react',
          'react-dom': 'react-dom'
        }
      }
    }
  }
})
