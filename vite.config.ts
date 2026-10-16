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
  // Los tests viven dentro de `src`, pero no deben formar parte de los tipos publicados.
  shouldIncludeDts && dts({ rollupTypes: true, exclude: ['node_modules/**', 'src/**/*.test.{ts,tsx}', 'src/test/**'] }),
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
    // `public/` es para las historias de Storybook (logo, audio y subtítulos de ejemplo) y para
    // documentos de trabajo que no se versionan. Ninguno forma parte de la librería, así que no se
    // copia a `dist/` y por tanto no se publica en npm. Storybook no depende de esta opción: copia
    // `public/` por su cuenta (comprobado con Storybook 10).
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'books-ui',
      // Se agregará la extension apropiada.
      fileName: 'books-ui',
      // Desde Vite 6 el CSS de una librería se llama como el `name` del package.json
      // (`books-ui.css`). `exports["./styles"]` apunta a `dist/style.css`, así que se conserva
      // el nombre anterior para no romper `import "books-ui/styles"` a quienes consumen la librería.
      cssFileName: 'style'
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
