import { defineConfig, globalIgnores } from 'eslint/config';
import pluginAngular from '@angular-eslint/eslint-plugin';
import parserAngular from '@angular-eslint/template-parser';
import typescriptEslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

const eslintConfig = defineConfig([
  globalIgnores(['dist/**', 'node_modules/**', '.angular/**', 'tools/**']),
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
