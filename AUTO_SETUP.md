# Auto - Configuración de Versionado Automático

Este proyecto usa [auto](https://intuit.github.io/auto/) para gestionar versiones, changelog y releases de forma automatizada.

## Plugins Instalados

- **npm**: Publica automáticamente a npm
- **conventional-commits**: Genera changelog basado en commits convencionales
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

El release se puede hacer de dos formas:

#### Opción A: Automático con shipit
```bash
npm run shipit
```

Esto:
1. Calcula la nueva versión
2. Actualiza el CHANGELOG.md
3. Hace commit y tag
4. Publica a npm
5. Crea release en GitHub

#### Opción B: Manual (recomendado para CI/CD)
```bash
npm run release
```

Usa el script personalizado `./scripts/release.sh`

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

### Error: "No token found"
Asegúrate de tener configurado `GITHUB_TOKEN` en las variables de entorno.

### Error: "Cannot publish"
Verifica que `NPM_TOKEN` esté configurado y que tengas permisos de publicación.

### No se genera versión
Verifica que tus PRs tengan las labels correctas y que los commits sigan el formato convencional.

## Más Información

- [Documentación oficial de auto](https://intuit.github.io/auto/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
