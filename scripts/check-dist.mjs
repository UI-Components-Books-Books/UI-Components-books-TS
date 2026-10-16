// Comprueba que, después de `npm run build`, existen todos los archivos que package.json
// declara como puntos de entrada del paquete (main, module, types y exports).
//
// Existe porque un cambio de herramienta puede renombrar un archivo generado sin que el build
// falle. Por ejemplo, Vite 6 llama `books-ui.css` al CSS de una librería en lugar de `style.css`,
// y `exports["./styles"]` apuntaría entonces a un archivo inexistente.
//
// Uso: npm run check:dist   (desde la raíz del proyecto, con `dist/` ya generado)
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const pkg = JSON.parse(readFileSync(resolve('package.json'), 'utf8'))

// Recorre un valor de package.json (cadena u objeto anidado de `exports`) y junta todas las rutas.
const entries = new Map() // ruta -> dónde se declara
const collect = (value, declaredIn) => {
  if (typeof value === 'string') {
    if (!entries.has(value)) entries.set(value, declaredIn)
  } else if (value && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) collect(nested, `${declaredIn}.${key}`)
  }
}

for (const field of ['main', 'module', 'types']) collect(pkg[field], field)
collect(pkg.exports, 'exports')

const missing = [...entries].filter(([path]) => !existsSync(resolve(path)))

if (entries.size === 0) {
  console.error('check:dist: package.json no declara main, module, types ni exports.')
  process.exit(1)
}

for (const [path, declaredIn] of entries) {
  console.log(`${existsSync(resolve(path)) ? 'OK       ' : 'NO EXISTE'}  ${path}  (${declaredIn})`)
}

if (missing.length > 0) {
  console.error(`\ncheck:dist: faltan ${missing.length} archivo(s) declarados en package.json. ¿Se ejecutó el build?`)
  process.exit(1)
}

console.log(`\ncheck:dist: los ${entries.size} archivos declarados existen.`)
