import { resolve } from 'path'

import react from '@vitejs/plugin-react'
import dotenv from 'dotenv';
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// Carga las variables de entorno
dotenv.config();

// Verifica si debemos incluir el plugin `vite-plugin-dts`
const shouldIncludeDts = process.env.SKIP_DTS !== 'true';

const plugins = [
  react(),
  shouldIncludeDts && dts({ rollupTypes: true }),
].filter(Boolean)

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components/index.ts'),
      '@utils': resolve(__dirname, './src/utils'),
      '@hooks': resolve(__dirname, './src/hooks/index.ts'),
      '@styles': resolve(__dirname, './src/styles'),
    },
  },
  plugins: plugins,
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
      external: ['react', 'react-dom', 'gsap', '@popperjs/core'],
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
