//import js from "@eslint/js";

const js = require("@eslint/js");
const htmlLint = require("@html-eslint/eslint-plugin");
const htmlParser = require("@html-eslint/parser");

const customPlugin = require("./eslint/custom-plugin")

//export default 
module.exports = [
  ////  client HTML
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
  ////  client JS IN HTML
  {
    files: ["src/**/*.js.html.js"],
    ignores: ["**/Date.js.html.js", "**/Datejs.js.html.js", "**/underscore-observe.js.html.js"],
    plugins: customPlugin.configs.recommended.plugins,
    languageOptions : {
      globals: {
        ...customPlugin.globals.client
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...customPlugin.configs.recommended.rules,

      "no-unused-vars": ["error", { 
        "varsIgnorePattern": customPlugin.globalsUsed.client
      }],
    },
  },
  ////  server GS
  {
    files: ["src/**/*.gs"],
    plugins: customPlugin.configs.recommended.plugins,
    languageOptions: {
      globals: {
        ...customPlugin.globals.server
      },
    },

    rules: {
      ...js.configs.recommended.rules,
      ...customPlugin.configs.recommended.rules,
      "no-unused-vars": ["error", { 
        "varsIgnorePattern": customPlugin.globalsUsed.server
      }],
      
    },
  },
  ////  other JS
  {
    files: ["**/*.js"],
    plugins: customPlugin.configs.recommended.plugins,
    rules: {
      ...js.configs.recommended.rules,
      ...customPlugin.configs.recommended.rules,
    },
  }
];
