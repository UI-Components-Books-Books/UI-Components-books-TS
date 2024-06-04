import { resolve } from 'path'

import react from '@vitejs/plugin-react'
import dotenv from 'dotenv';
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// Carga las variables de entorno
dotenv.config();

// Verifica si debemos incluir el plugin `vite-plugin-dts`
const shouldIncludeDts = process.env.SKIP_DTS !== 'true';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    shouldIncludeDts && dts({ rollupTypes: true }),
  ].filter(Boolean), // Filtra los plugins falsos (null, undefined, false)
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
