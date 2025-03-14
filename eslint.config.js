import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

export default [
  {
    ignores: ["./dist/**/*"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ["**/*.test.js", "**/*.spec.js", "test/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
  js.configs.recommended,
  eslintConfigPrettier,
];
