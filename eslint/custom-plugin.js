const plugin = require("..")

const braceStyleCustom = require('./rules/brace-style-custom')

const globals = require("globals");
const gas = require("eslint-plugin-googleappsscript")

const globalsC = require("./globals/globals")
const globalsServer = require("./globals/gas-server")
const globalsClient = require("./globals/gas-client")
const globalsUsedServer = require("./globalsUsed/gas-server")
const globalsUsedClient = require("./globalsUsed/gas-client")


module.exports = {
  rules: {
    "brace-style-custom": braceStyleCustom
  },
  globals: {
    server: {
      ...globalsServer,
      ...gas.environments.googleappsscript.globals
    },
    client: {
      ...globalsClient,
      ...globals.browser,
      ...globals.jquery
    }
  },
  globalsUsed: {
    server: globalsUsedServer,
    client: globalsUsedClient
  },
  plugins: {
    "custom-rules": plugin
  },
  configs: {
    rules: {
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
      "array-element-newline": ["warn", "consistent"],
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
        "varsIgnorePattern": globalsC
      }],
    }
  }
}
