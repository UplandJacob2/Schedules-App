//import eslintPlugin from '@typescript-eslint/eslint-plugin'
//import js from "@eslint/js";

const js = require("@eslint/js");
const htmlLint = require("@html-eslint/eslint-plugin");
const html = require("eslint-plugin-html")
const htmlParser = require("@html-eslint/parser");

//export default 
module.exports = [
  //js.configs.recommended,
  {
    files: ["**.html"],
    ignores: [".github/**", "DateTEST.js.html", "Datejs.js.html"],
    plugins: { html },
    settings: {
      "html/indent": "+2",
    },

    languageOptions: {
      //ecmaVersion: "latest",
      //sourceType: "module",
      //parser: "eslintPlugin/parser",
      parser: htmlParser,
    },
    ...htmlLint.configs["flat/recommended"],
    rules: {
      ...htmlLint.configs["flat/recommended"].rules,
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
        Utilities: "readonly",
        XmlService: "readonly",
        HtmlService: "readonly",
        CacheService: "readonly",
        MailApp: "readonly",
        UrlFetchApp: "readonly",
        DocumentApp: "readonly",
        SpreadsheetApp: "readonly",
        DriveApp: "readonly",
        Drive: "readonly",

        SchedulesSecure: "writable",
        DateUtils: "writable",
        
        console: "readonly",
        
        l: "writable",
      },
    },

    rules: {
      ...js.configs.recommended.rules,
      semi: "off",
      quotes: ["warn", "single"],
      indent: ["warn", 2],
    },


  },

];
