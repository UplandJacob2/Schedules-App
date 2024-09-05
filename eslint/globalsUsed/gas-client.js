const globalsUsedClient = require("../globals/gas-client")
let clientUsedregex = "(.+_$)"
const clientGlobalsUsedKeys = Object.keys(globalsUsedClient)
for (let k = 0; k < clientGlobalsUsedKeys.length; k++) {
  clientUsedregex += "|(^"+clientGlobalsUsedKeys[k]+"$)"
}
module.exports = clientUsedregex
