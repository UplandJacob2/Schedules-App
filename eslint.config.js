//import eslintPlugin from '@typescript-eslint/eslint-plugin'
//import js from "@eslint/js";
//const eslintPlugin = require("@typescript-eslint/eslint-plugin");
const js = require("@eslint/js");
const html = require("@html-eslint/eslint-plugin");
const htmlParser = require("@html-eslint/parser");

//export default 
module.exports = [
  js.configs.recommended,
  {
    files: ["**.html"],
    ignores: [".github/**"],
    plugins: { /*eslintPlugin*/ },

    languageOptions: {
      //ecmaVersion: "latest",
      //sourceType: "module",
      //parser: "eslintPlugin/parser",
      parser: htmlParser,
    },
    ...html.configs["flat/recommended"],
    rules: {
      ...html.configs["flat/recommended"].rules,
      semi: "off",
      quotes: ["error", "single"],
      "@html-eslint/indent": [2, "warn"],

    },
  },
  {
    files: ["**.gs"],
    ignores: [".github/**"],

    rules: {
      semi: "off",
      quotes: ["error", "single"],
      indent: [2, "warn"]
    },


  },

];
