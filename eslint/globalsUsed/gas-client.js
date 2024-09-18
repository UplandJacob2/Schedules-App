const globalsUsedClient = require("../globals/gas-client")
const clientGlobalsUsedKeys = Object.keys(globalsUsedClient)
let clientUsedregex = "(.+_$)"
for(let k = 0; k < clientGlobalsUsedKeys.length; k++) {
  clientUsedregex += "|(^"+clientGlobalsUsedKeys[k]+"$)"
}
module.exports = clientUsedregex
