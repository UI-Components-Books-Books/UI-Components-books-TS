import { resolve } from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Configuración de pruebas separada de `vite.config.ts` para no cargar
// el plugin `vite-plugin-dts` ni el build de la librería al correr los tests.
export default defineConfig({
  resolve: {
    // Mismos alias que `vite.config.ts` y `tsconfig.json`.
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components/index.ts'),
      '@utils': resolve(__dirname, './src/utils'),
      '@hooks': resolve(__dirname, './src/hooks/index.ts'),
      '@styles': resolve(__dirname, './src/styles'),
    },
  },
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // Los tests no dependen de los estilos; evita procesar los .css importados.
    css: false,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'html'],
      include: ['src/components/**/*.{ts,tsx}', 'src/hooks/**/*.ts', 'src/utils/**/*.ts'],
      exclude: ['**/*.stories.tsx', '**/*.test.{ts,tsx}', '**/types/**', '**/index.ts'],
    },
  },
})
