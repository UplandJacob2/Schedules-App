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
      "comma-spacing": ["warn", { 
        "before": false, 
        "after": true 
      }],
      "computed-property-spacing": ["warn", "never"],
      curly: ["warn", "multi-line"],
      "default-case": "error",
      "default-case-last": "warn",
      "default-param-last": ["error"],
      "dot-location": ["error", "property"],
      "dot-notation": "error",
      eqeqeq: "warn",
      "for-direction": "error",
      "func-call-spacing": ["warn", "never"],
      "func-names": ["warn", "as-needed"],
      "generator-star-spacing": ["warn", {"before": true, "after": false}],
      indent: ["error", 2, {
        SwitchCase: 1
      }],
      "jsx-quotes": ["warn", "prefer-double"],
      "key-spacing": ["warn", { "beforeColon": false }],
      "keyword-spacing": ["error", { "overrides": {
        "if": { "after": false },
        "for": { "after": false },
        "while": { "after": false },
        "catch": { "after": false }
      } }],
      "no-trailing-spaces": "warn",
      "no-unused-vars": ["error", { 
        "varsIgnorePattern": globalsC
      }],
      "no-use-before-define": "error",
      "no-useless-concat": "warn",
      "no-var": "warn",
      "prefer-template": "warn",
      quotes: ["warn", "single"],
      semi: "off",
    }
  }
}
