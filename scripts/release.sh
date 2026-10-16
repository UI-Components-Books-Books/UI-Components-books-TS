#!/usr/bin/env bash
# Publica una versión nueva: `auto` calcula el tipo de cambio, se actualiza el CHANGELOG, se publica
# en npm y se crea el release en GitHub. Se lanza con `npm run release`, que compila antes.
#
# Se detiene en el primer comando que falle. Sin esto, si `npm publish` fallaba el script seguía
# y subía a GitHub una etiqueta de versión que no existía en npm.
set -euo pipefail

# Todos los comandos (`auto`, `npm version`, `git push`) deben ejecutarse en la raíz del proyecto,
# se lance el script desde donde se lance.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# `auto` vive en node_modules/.bin. `npm run` ya lo agrega al PATH; esto permite además ejecutar el
# script directamente. Antes se usaba `$(npm bin)`, que se eliminó en npm 9: en npm 11 imprime un
# mensaje de error y ese texto acababa dentro del PATH.
export PATH="$ROOT/node_modules/.bin:$PATH"

# `auto version` imprime el tipo de cambio (major, minor o patch), o nada si no hay que publicar.
# Si falla, el script se detiene en lugar de saltarse la publicación sin avisar.
VERSION="$(auto version)"

# Con el plugin conventional-commits, `feat:` sube minor, `fix:` sube patch y `!` o
# `BREAKING CHANGE` suben major; `refactor:`, `chore:`, etc. no suben versión. También sale vacío
# con la etiqueta 'skip-release'. Se avisa en lugar de terminar en silencio.
if [ -z "$VERSION" ]; then
  echo "No hay nada que publicar: ningún cambio desde el último release sube la versión."
  exit 0
fi

## Update Changelog
auto changelog

## Publish Package
# --no-commit-hooks: el commit "Bump version" no sigue las convenciones y lo rechazaría commitlint.
npm --allow-same-version version "$VERSION" --no-commit-hooks -m "Bump version to: %s [skip ci]"
npm publish --access=public

## Create GitHub Release
git push --follow-tags origin main
auto release
