const braceStyleCustom = require('./rules/brace-style-custom')

const globals = require("globals");
const gas = require("eslint-plugin-googleappsscript")

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
    server: [
      ...globalsUsedServer
    ],
    client: [
      ...globalsUsedClient
    ]
  }
}
