const globalsUsedServer = require("../globals/gas-server")
const serverGlobalsUsedKeys = Object.keys(globalsUsedServer)
console.log(serverGlobalsUsedKeys)
let serverUsedregex = "(.+_$)"
for (let k = 0; k < serverGlobalsUsedKeys.length; k++) {
  serverUsedregex += "|(^"+serverGlobalsUsedKeys[k]+"$)"
}
module.exports = serverUsedregex
