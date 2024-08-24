//import eslintPlugin from '@typescript-eslint/eslint-plugin'
//import js from "@eslint/js";

const js = require("@eslint/js");
const htmlLint = require("@html-eslint/eslint-plugin");
const htmlPlug = require("eslint-plugin-html")
const htmlParser = require("@html-eslint/parser");
const globals = require("globals");
const googleappsscript = require("eslint-plugin-googleappsscript")

//export default 
module.exports = [
  //js.configs.recommended,
  {
    files: ["**.html"],
    ignores: [".github/**", "DateTEST.js.html", "Datejs.js.html"],
    plugins: { html: htmlPlug },
    settings: {
      "html/indent": "+2",
      "html/report-bad-indent": "warn"
    },

    languageOptions: {
      //ecmaVersion: "latest",
      //sourceType: "module",
      //parser: "eslintPlugin/parser",
      parser: htmlParser,
      globals: {
        ...globals.browser,
        ...globals.jquery,
      },
    },
    ...htmlLint.configs["flat/recommended"],
    rules: {
      ...htmlLint.configs["flat/recommended"].rules,
      "@html-eslint/indent": "off",
      "@html-eslint/element-newline": "off",
      "@html-eslint/attrs-newline": "off",
      "@html-eslint/no-obsolete-tags": "warn",
      "@html-eslint/require-closing-tags": ["warn", {
        "selfClosing": "always", 
        "selfClosingCustomPatterns": ["ion-icon"]
      }],


    },
  },
  {
    files: ["**.gs"],
    ignores: [".github/**"],
    plugins: { googleappsscript },
    languageOptions: {
      globals: {
        ...googleappsscript.globals,
        /*Utilities: "readonly",
        XmlService: "readonly",
        HtmlService: "readonly",
        CacheService: "readonly",
        MailApp: "readonly",
        UrlFetchApp: "readonly",
        DocumentApp: "readonly",
        SpreadsheetApp: "readonly",
        DriveApp: "readonly",*/
        Drive: "readonly",

        SchedulesSecure: "writable",
        DateUtils: "writable",
        
        console: "readonly",
        
        l: "writable",
        w: "writable",
        e: "writable",
      },
    },

    rules: {
      ...googleappsscript.configs.recommended.rules,
      ...js.configs.recommended.rules,
      semi: "off",
      quotes: ["warn", "single"],
      indent: ["warn", 2],
    },


  },

];
