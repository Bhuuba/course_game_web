import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.ts"],
    ignores: ["lib"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      sourceType: "module",
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      "import/order": ["error", { "alphabetize": { "order": "asc" } }],
    },
  },
]);
