//import eslintPlugin from '@typescript-eslint/eslint-plugin'
//import js from "@eslint/js";

const js = require("@eslint/js");
const htmlLint = require("@html-eslint/eslint-plugin");
const htmlParser = require("@html-eslint/parser");
const globals = require("globals");
const googleappsscript = require("eslint-plugin-googleappsscript")

const globalsUsed = {
  DateUtils: "writable",
  Base64: "writable",
  Editor: "writable",
  DebugLog: "writable",
  
  loadSheet: "writable",
  toggleDisplay: "writable",
  SHEET: "writable",
  USER_SETTINGS: "writable",
  error: "writable",
  
  getToken: "writable",
  getEmail: "writable",
  setCookie: "writable",
  deleteSignInCookies: "writable",
  
  jsonReparse: "writable",
  confirmPopup: "writable",
  signInF: "writable",
  signUp: "writable",
  signInSuccess: "writable",
  signOutBtn: "writable",
  
  checkSignUpButton: "writable",
  checkSignInButton: "writable",
  checkEmailBox: "writable",
  checkPassBox: "writable",
  
  resizeInput: "writable",

  newSchedulesFail: "writable",
  getSchedulesSuccess: "writable",
  recoverSchedulesFail: "writable",
  recoverSchedulesSuccess: "writable",

  l: "writable",
  w: "writable",
  e: "writable",
}
const globalsUsedKeys = Object.keys(globalsUsed)
let regexStr = "(.+_$)"
for (let k = 0; k < globalsUsedKeys.length; k++) {
  regexStr += "|(^"+globalsUsedKeys[k]+"$)"
}


//export default 
module.exports = [
  //js.configs.recommended,
  {
    files: ["src/**/*.html"],
    ignores: ["src/**/*.js.html"],

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
        //"selfClosingCustomPatterns": ["ion-icon"],
      }],


    },
  },
  {
    files: ["src/**/*.js.html.js"],
    ignores: ["**/Date.js.html.js", "**/Datejs.js.html.js", "**/underscore-observe.js.html.js"],
    languageOptions : {
      globals: {
        ...globals.browser,
        ...globals.jquery,
        
        _: "readonly",
        google: "readonly",
        tui: "readonly",

        ...globalsUsed,        
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      semi: "off",

      "no-unused-vars": ["error", { 
        "varsIgnorePattern": regexStr
      }],
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
        "before": true, 
        "after": true 
      }],
      "block-scoped-var": "error",
      "block-spacing": "warn",
      "brace-style": ["error", "1tbs", { 
        "allowSingleLine": true 
      }],
      curly: ["warn", "multi-line"],


      "no-unused-vars": ["error", { 
        "varsIgnorePattern": regexStr 
      }],
      
    },


  },

];
