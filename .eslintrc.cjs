module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react-hooks/recommended', 'plugin:storybook/recommended'],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', 'eslint-plugin-import', 'unused-imports', 'jsx-a11y'],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", "internal"],  // Define los grupos de importaciones.
        "pathGroups": [
          {
            "pattern": "react",
            "group": "external",
            "position": "before" // Asegura que las importaciones de 'react' estén antes de cualquier otro grupo.
          },
          {
            "pattern": ".css",
            "group": "internal",
            "position": "after" // Coloca las importaciones de archivos .css al final del grupo 'internal'.
          }
        ],
        "pathGroupsExcludedImportTypes": ["react"], // Excluye a 'react' del ordenamiento ya que se maneja por separado.
        "newlines-between": "always", // Añade una línea en blanco entre grupos de importaciones.
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true // Ordena alfabéticamente las importaciones dentro de cada grupo.
        }
      }
    ],
    "unused-imports/no-unused-imports": "warn",
    'jsx-a11y/alt-text': 'warn',
  },
}
