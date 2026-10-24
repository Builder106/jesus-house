import { defineConfig, globalIgnores } from 'eslint/config';
import pluginAngular from '@angular-eslint/eslint-plugin';
import parserAngular from '@angular-eslint/template-parser';
import typescriptEslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

const eslintConfig = defineConfig([
  globalIgnores(['dist/**', 'coverage/**', 'node_modules/**', '.angular/**', 'tools/**']),
  ...typescriptEslint.configs.recommended,
  {
    files: ['**/*.ts'],
    plugins: {
      '@angular-eslint': pluginAngular,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: ['app', 'jh'],
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: ['app', 'jh'],
          style: 'kebab-case',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['src/**/*.ts'],
    ignores: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSUnknownKeyword',
          message: 'Use a concrete type; keep unknown only at validated data or error boundaries.',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    plugins: {
      '@angular-eslint': pluginAngular,
    },
    languageOptions: {
      parser: parserAngular,
    },
    rules: {},
  },
  prettierConfig,
]);

export default eslintConfig;
