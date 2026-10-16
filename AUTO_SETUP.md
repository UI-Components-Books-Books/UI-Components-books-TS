# Auto - Configuración de Versionado Automático

Este proyecto usa [auto](https://intuit.github.io/auto/) para gestionar versiones, changelog y releases de forma automatizada.

## ⚠️ Configuración Inicial Requerida

Antes de usar `auto`, necesitas configurar tu token de GitHub:

### 1. Crear Token de GitHub
1. Ve a https://github.com/settings/tokens/new
2. Dale un nombre: `auto-release-token`
3. Selecciona permisos: **repo** (todos los scopes)
4. Genera el token y cópialo

### 2. Configurar Variables de Entorno
```bash
# Copia el archivo de ejemplo
cp .env.example .env
```

Edita `.env` y agrega tu token:
```
GITHUB_TOKEN=ghp_tu_token_aqui
GH_TOKEN=ghp_tu_token_aqui
```

Para publicar en npm no se usa `.env`: `npm publish` toma la sesión de `npm login` o el token de tu
`~/.npmrc`. Comprueba que estás dentro con `npm whoami`.

### 3. Verificar Configuración
```bash
npm run version  # Debería funcionar sin errores
```

## Plugins Instalados

- **npm**: Publica automáticamente a npm
- **conventional-commits**: Calcula la versión a partir de los mensajes de commit (`feat:` → minor, `fix:` → patch, `!` o `BREAKING CHANGE` → major). `refactor:`, `chore:`, `docs:`, etc. no suben versión
- **released**: Marca PRs y issues como released
- **first-time-contributor**: Agradece a nuevos contribuidores

## Labels de GitHub

El proyecto está configurado con las siguientes labels para controlar el versionado:

- `major` 💥 - Breaking changes (incrementa versión mayor: 1.0.0 → 2.0.0)
- `minor` 🚀 - Nuevas funcionalidades (incrementa versión menor: 1.0.0 → 1.1.0)
- `patch` 🐛 - Corrección de bugs (incrementa versión patch: 1.0.0 → 1.0.1)
- `skip-release` - No crear release
- `release` - Forzar creación de release
- `internal` 🏠 - Cambios internos (no afecta versión)
- `documentation` 📝 - Solo documentación (no afecta versión)
- `tests` 🧪 - Solo tests (no afecta versión)
- `dependencies` 🔩 - Actualización de dependencias (patch)
- `performance` 🏎 - Mejoras de rendimiento (patch)

## Scripts Disponibles

```bash
# Ver qué versión se generaría
npm run version

# Generar changelog
npm run changelog

# Release manual (usado en CI)
npm run release
```

## Uso en Development

### 1. Commits Convencionales

Usa commits siguiendo el estándar conventional commits:

```bash
npm run cz  # Abre el asistente de Commitizen
```

Ejemplos:
- `feat: añadir nuevo componente Button`
- `fix: corregir error en Modal`
- `docs: actualizar README`
- `chore: actualizar dependencias`

### 2. Pull Requests

Cuando crees un PR, añade la label apropiada según el tipo de cambio:
- Nuevas funcionalidades → `minor`
- Corrección de bugs → `patch`
- Breaking changes → `major`
- Cambios sin release → `skip-release`

### 3. Release

Usa el script de release que incluye build:

```bash
npm run release
```

Este script:
1. Compila el proyecto (`npm run build`)
2. Ejecuta `./scripts/release.sh` que:
   - Calcula la nueva versión con `auto version`
   - Genera el CHANGELOG con `auto changelog`
   - Hace commit y tag
   - Publica a npm
   - Crea release en GitHub con `auto release`

## Configuración CI/CD

### GitHub Actions (Ejemplo)

```yaml
name: Release

on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}
      
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      
      - run: npm ci
      
      - run: npm run release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Variables de Entorno Necesarias

Para que auto funcione correctamente en CI/CD, necesitas configurar:

- `GITHUB_TOKEN`: Token de GitHub (automático en GitHub Actions)
- `NPM_TOKEN`: Token para publicar en npm

## Crear Labels en GitHub

Para crear las labels automáticamente en tu repositorio:

```bash
auto create-labels
```

## Troubleshooting

### Error: "Received 404!" o "No token found"
**Solución**: Crea el archivo `.env` con tu `GITHUB_TOKEN`:
```bash
cp .env.example .env
# Edita .env y agrega tu token de GitHub
```

### Error: "Cannot publish"
Ejecuta `npm whoami`: si responde `E401`, vuelve a entrar con `npm login`. Comprueba además que tu usuario tenga permisos de publicación sobre el paquete.

### Error: Repositorio no encontrado
Verifica que el `owner` y `repo` en `.autorc` coincidan con tu repositorio de GitHub.

### No se genera versión
`npm run release` avisa "No hay nada que publicar" cuando ningún cambio desde el último release sube la versión. El versionado sale de los mensajes de commit (conventional commits) o de las **labels de GitHub** del PR. Asegúrate de:
- Usar `feat:` (minor), `fix:` (patch) o `!` / `BREAKING CHANGE` (major) en los commits; `refactor:`, `chore:` y `docs:` no suben versión
- O poner labels `patch`, `minor`, `major` en tus PRs (la label tiene prioridad sobre el mensaje)

## Más Información

- [Documentación oficial de auto](https://intuit.github.io/auto/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
