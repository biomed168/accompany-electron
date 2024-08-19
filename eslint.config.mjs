import globals from 'globals'
import pluginJs from '@eslint/js'
import tsEslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  { files: ['**/*.{ts,tsx}'] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tsEslint.configs.recommended,
  {
    files: ['**/*.tsx', '**/*.ts'],
    languageOptions: { parserOptions: { parser: tsEslint.parser } },
  },
  {
    files: ['**/*.tsx', '**/*.ts'],
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    },
  },
  {
    ignores: ['node_modules'],
  },
  eslintConfigPrettier,
]
