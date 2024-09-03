//import eslintPlugin from '@typescript-eslint/eslint-plugin'
//import js from "@eslint/js";

const js = require("@eslint/js");
const htmlLint = require("@html-eslint/eslint-plugin");
const htmlParser = require("@html-eslint/parser");
const globals = require("globals");
const googleappsscript = require("eslint-plugin-googleappsscript")

import braceStyleCustom from './rules/brace-style-custom';

const globalsUsed = {
  getSchedule: "writable",
  getDaysOff: "writable",
  confirmSignUp: "writable",
  signIn: "writable",
  signInWToken: "writable",
  doGet: "writable",
  include: "writable",
  _: "writable",
  
  DateUtils: "writable",
  Base64: "writable",
  Editor: "writable",
  DebugLog: "writable",
  
  loadSheet: "writable",
  saveSettings: "writable",
  openMenu: "writable",
  
  SHEET: "writable",
  USER_SETTINGS: "writable",
  
  getToken: "writable",
  getEmail: "writable",
  setCookie: "writable",
  getCookie: "writable",
  deleteSignInCookies: "writable",
  
  jsonReparse: "writable",
  confirmPopup: "writable",
  resizeInput: "writable",
  toggleDisplay: "writable",
  error: "writable",

  signInF: "writable",
  signUp: "writable",
  signInSuccess: "writable",
  signOutBtn: "writable",
  deleteSch: "writable",
  editPopClose: "writable",
  
  checkSignUpButton: "writable",
  checkSignInButton: "writable",
  checkEmailBox: "writable",
  checkPassBox: "writable",
  showPassword: "writable",
  
  newSchedulesFail: "writable",
  getSchedulesSuccess: "writable",
  recoverSchedulesFail: "writable",
  recoverSchedulesSuccess: "writable",
  recoverSpecificSchedule: "writable",

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
  ////  HTML
  {
    files: ["src/**/*.html"],
    ignores: ["src/**/*.js.html"],

    languageOptions: {
      parser: htmlParser,
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
        "selfClosingCustomPatterns": ["ion-icon"],
      }],


    },
  },
  //// JS IN HTML
  {
    files: ["src/**/*.js.html.js"],
    ignores: ["**/Date.js.html.js", "**/Datejs.js.html.js", "**/underscore-observe.js.html.js"],
    plugins: {
      "custom-rules": {
        rules: {
          "brace-style-custom": braceStyleCustom
        }
      }
    },
    languageOptions : {
      globals: {
        ...globals.browser,
        ...globals.jquery,
        
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
  //// GS
  {
    files: ["src/**/*.gs"],
    plugins: {
      googleappsscript, 
      "custom-rules": {
        rules: {
          "brace-style-custom": braceStyleCustom
        }
      },
    },
    languageOptions: {
      globals: {
        ...googleappsscript.environments.googleappsscript.globals,

        Underscore: "writable",

        SchedulesSecure: "writable",
        DateUtils: "writable",
        
        ...globalsUsed,
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
