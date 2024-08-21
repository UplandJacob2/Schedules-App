import eslintPlugin from '@typescript-eslint/eslint-plugin'

export default [
  {
    files: ["**.gs", "**.html"],
    ignores: [".github/**"],
    plugins: { eslintPlugin },

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: "eslintPlugin/parser",
    },

    rules: {
      semi: "none",
      quotes: ["error", "single"],

    },
  },

];
