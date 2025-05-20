import { FlatCompat } from '@eslint/eslintrc';
import eslintPluginJs from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: eslintPluginJs.configs.recommended,
  allConfig: eslintPluginJs.configs.all,
});

const eslintConfig = [
  ...compat.config({
    env: {
      browser: true,
      es2024: true,
      node: true,
    },
  }),
  {
    ignores: [
      '**/node_modules/**',
      '**/expo/**',
      '**/.vscode/**',
      '**/.husky/**',
      '**/.idea/**',
      'metro.config.js',
      'expo-env.d.ts',
      '**/scripts/**',
      'plugin.js',
    ],
    languageOptions: {
      globals: {
        React: 'readonly',
        JSX: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'simple-import-sort': eslintPluginSimpleImportSort,
      'unused-imports': unusedImports,
      'import': eslintPluginImport,
    },
    rules: {
      'no-duplicate-imports': 'error',
      'import/first': 'error',
      'import/no-duplicates': 'error',
      'import/no-useless-path-segments': 'error',
      'react-hooks/exhaustive-deps': 'off',
      'no-unused-vars': 'off',
      'no-console': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'react/no-unescaped-entities': 'off',
      'react/display-name': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'simple-import-sort/exports': 'warn',
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            ['^@?\\w', '^\\u0000'],
            ['^.+\\.s?css$'],
            ['^@/libs', '^@/hooks'],
            ['^@/data'],
            ['^@/components', '^@/container'],
            ['^@/store'],
            ['^@/'],
            [
              '^\\./?$',
              '^\\.(?!/?$)',
              '^\\.\\./?$',
              '^\\.\\.(?!/?$)',
              '^\\.\\./\\.\\./?$',
              '^\\.\\./\\.\\.(?!/?$)',
              '^\\.\\./\\.\\./\\.\\./?$',
              '^\\.\\./\\.\\./\\.\\.(?!/?$)',
            ],
            ['^@/types'],
            ['^'],
          ],
        },
      ],
    },
  },
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ),
];

export default eslintConfig;
