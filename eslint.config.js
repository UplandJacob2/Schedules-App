//import eslintPlugin from '@typescript-eslint/eslint-plugin'
//import js from "@eslint/js";

const js = require("@eslint/js");
const htmlLint = require("@html-eslint/eslint-plugin");
const htmlParser = require("@html-eslint/parser");
const globals = require("globals");
const googleappsscript = require("eslint-plugin-googleappsscript")

const customPlugin = require("./eslint/custom-plugin")

// const globalsUsed = {
//   _: "writable",
  
//   DateUtils: "writable",
//   Base64: "writable",
//   Editor: "writable",
//   DebugLog: "writable",

//   l: "writable",
//   w: "writable",
//   e: "writable",
// }
// const globalsUsedClient = {
//   ...globalsUsed,
//   loadSheet: "writable",
//   saveSettings: "writable",
//   openMenu: "writable",
  
//   SHEET: "writable",
//   USER_SETTINGS: "writable",
  
//   getToken: "writable",
//   getEmail: "writable",
//   setCookie: "writable",
//   getCookie: "writable",
//   deleteSignInCookies: "writable",
  
//   jsonReparse: "writable",
//   confirmPopup: "writable",
//   resizeInput: "writable",
//   toggleDisplay: "writable",
//   error: "writable",
  
//   signInF: "writable",
//   signUp: "writable",
//   signInSuccess: "writable",
//   signOutBtn: "writable",
//   deleteSch: "writable",
//   editPopClose: "writable",
  
//   checkSignUpButton: "writable",
//   checkSignInButton: "writable",
//   checkEmailBox: "writable",
//   checkPassBox: "writable",
//   showPassword: "writable",
  
//   newSchedulesFail: "writable",
//   getSchedulesSuccess: "writable",
//   recoverSchedulesFail: "writable",
//   recoverSchedulesSuccess: "writable",
//   recoverSpecificSchedule: "writable",
// }
// const globalsUsedServer = {
//   ...globalsUsed,
//   getSchedule: "writable",
//   getDaysOff: "writable",
//   confirmSignUp: "writable",
//   signIn: "writable",
//   signInWToken: "writable",
//   doGet: "writable",
//   include: "writable",
// }

// const serverGlobalsUsedKeys = Object.keys(globalsUsedServer)
// let serverUsedregex = "(.+_$)"
// for (let k = 0; k < serverGlobalsUsedKeys.length; k++) {
//   serverUsedregex += "|(^"+serverGlobalsUsedKeys[k]+"$)"
// }
// let clientUsedregex = "(.+_$)"
// const clientGlobalsUsedKeys = Object.keys(globalsUsedClient)
// for (let k = 0; k < clientGlobalsUsedKeys.length; k++) {
//   clientUsedregex += "|(^"+clientGlobalsUsedKeys[k]+"$)"
// }


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
        "selfClosingCustomPatterns": ["^ion-icon$"],
      }],


    },
  },
  //// JS IN HTML
  {
    files: ["src/**/*.js.html.js"],
    ignores: ["**/Date.js.html.js", "**/Datejs.js.html.js", "**/underscore-observe.js.html.js"],
    plugins: {
      "custom-rules": customPlugin
    },
    languageOptions : {
      globals: {
        // ...globals.browser,
        // ...globals.jquery,
        ...customPlugin.globals.client,
        
        google: "readonly",
        tui: "readonly",

        // ...globalsUsedClient,        
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      semi: "off",

      "no-unused-vars": ["error", { 
        "varsIgnorePattern": customPlugin.globalsUsed.client  //clientUsedregex
      }],
    },

  },
  //// GS
  {
    files: ["src/**/*.gs"],
    plugins: {
      googleappsscript, 
      "custom-rules": customPlugin
    },
    languageOptions: {
      globals: {
        // ...googleappsscript.environments.googleappsscript.globals,

        Underscore: "writable",

        SchedulesSecure: "writable",
        DateUtils: "writable",
        ...customPlugin.globals.server
        // ...globalsUsedServer,
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
      "custom-rules/brace-style-custom": ["error", "1tbs", { 
        allowSingleLine: true,
        stroustrupAfterSingleLine: true,
        allowDualSingleLine: true
      }],
      curly: ["warn", "multi-line"],


      "no-unused-vars": ["error", { 
        "varsIgnorePattern": customPlugin.globalsUsed.server  //serverUsedregex 
      }],
      
    },


  },

];
