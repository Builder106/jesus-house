import { defineConfig, globalIgnores } from "eslint/config";
import pluginAngular from "@angular-eslint/eslint-plugin";
import parserAngular from "@angular-eslint/template-parser";
import typescriptEslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = defineConfig([
  globalIgnores(["dist/**", "node_modules/**", ".angular/**"]),
  ...typescriptEslint.configs.recommended,
  {
    files: ["**/*.ts"],
    plugins: {
      "@angular-eslint": pluginAngular,
    },
    languageOptions: {
      parserOptions: {
        project: ["tsconfig.json", "tsconfig.app.json"],
      },
    },
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    plugins: {
      "@angular-eslint": pluginAngular,
    },
    languageOptions: {
      parser: parserAngular,
    },
    rules: {},
  },
  prettierConfig,
]);

export default eslintConfig;