//import eslintPlugin from '@typescript-eslint/eslint-plugin'
const eslintPlugin = require("@typescript-eslint/eslint-plugin");

//export default 
modules.exports = [
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
