export PATH=$(npm bin):$PATH

VERSION=`auto version`

## Support for label 'skip-release'
if [ ! -z "$VERSION" ]; then
  ## Update Changelog
  auto changelog

  ## Publish Package
  npm --allow-same-version version $VERSION --no-commit-hook -m "Bump version to: %s [skip ci]"
  npm publish --access=public

  ## Create GitHub Release
  git push --follow-tags --set-upstream origin $branch
  auto release
fi