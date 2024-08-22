//import eslintPlugin from '@typescript-eslint/eslint-plugin'
//import js from "@eslint/js";
//const eslintPlugin = require("@typescript-eslint/eslint-plugin");
const js = require("@eslint/js");

//export default 
module.exports = [
  js.configs.recommended,
  {
    files: ["**.gs", "**.html"],
    ignores: [".github/**"],
    plugins: { /*eslintPlugin*/ },

    /*languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: "eslintPlugin/parser",
    },*/

    rules: {
      semi: "off",
      quotes: ["error", "single"],

    },
  },

];
