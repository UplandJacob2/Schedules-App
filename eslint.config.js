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
    files: ["src/**/*.html"],
    excludedFiles: ["src/**/*.js.html"],
    // plugins: { html: htmlPlug },
    // settings: {
    //   "html/indent": "+2",
    //   "html/report-bad-indent": "warn"
    // },

    languageOptions: {
      //ecmaVersion: "latest",
      //sourceType: "module",
      //parser: "eslintPlugin/parser",
      parser: htmlParser,
      // globals: {
      //   ...globals.browser,
      //   ...globals.jquery,
      // },
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
    files: ["src/**/*.js.html.js"],
    excludedFiles: ["src/Date.js.html.js", "src/Datejs.js.html.js"],
    languageOptions : {
      globals: {
        ...globals.browser,
        ...globals.jquery,
        
        _: "readonly",
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      semi: "off",


    },

  },
  {
    files: ["src/**/*.gs"],
    plugins: { googleappsscript },
    languageOptions: {
      globals: {
        ...googleappsscript.environments.googleappsscript.globals,
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

        Underscore: "writable",
        _: "writable",

        SchedulesSecure: "writable",
        DateUtils: "writable",
        
        console: "readonly",
        
        l: "writable",
        w: "writable",
        e: "writable",
      },
    },

    rules: {
      ...js.configs.recommended.rules,
      semi: "off",
      quotes: ["warn", "single"],
      indent: ["warn", 2],
      "no-trailing-spaces": "warn",
      eqeqeq: "warn",
      "no-var": "warn",
      "no-use-before-define": "error",
      
      "prefer-template": "warn",
      "no-useless-concat": "warn",
      
      "array-bracket-newline": ["warn", {
        "multiline": true
      }],
      "array-bracket-spacing": ["warn", "always", { 
        "singleValue": false 
      }],
      "array-element-newline": ["warn", {
        "multiline": true
      }],
      "arrow-body-style": ["warn", "as-needed"],
      "arrow-parens": ["error", "as-needed"],
      "arrow-spacing": ["warn", { 
        "before": false, 
        "after": true 
      }],
      "block-scoped-var": "error",
      "block-spacing": "warn",
      "brace-style": ["error", "1tbs", { 
        "allowSingleLine": true 
      }],
      curly: ["warn", "multi-line"]
      
    },


  },

];
