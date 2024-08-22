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
      "@html-eslint/indent": ["warn", 2],
      "@html-eslint/element-newline": "warn",
      "@html-eslint/attrs-newline": "off",
      "@html-eslint/no-obsolete-tags": "warn",

    },
  },
  {
    files: ["**.gs"],
    ignores: [".github/**"],
    languageOptions: {
      globals: {
        HtmlService: "readonly",
        CacheService: "readonly",
        SpreadsheetApp: "readonly",
        DriveApp: "readonly",
        Drive: "readonly",
        Utilities: "readonly",
        MailApp: "readonly",
        console: "readonly",
        SchedulesSecure: "writable",
      },
    },

    rules: {
      semi: "off",
      quotes: ["error", "single"],
      indent: ["warn", 2],
    },


  },

];
