const globalsUsed = require("./globals")
module.exports = {
  ...globalsUsed,

  Underscore: "writable",

  SchedulesSecure: "writable",
  DateUtils: "writable",

  getSchedule: "writable",
  getDaysOff: "writable",
  signUp: "writable",
  confirmSignUp: "writable",
  signIn: "writable",
  signInWToken: "writable",
  doGet: "writable",
  include: "writable",
  getScriptURL: "writable",

  gitHubRelease: "writable",
  minifyAll: "writable",
  githubCommit: "writable",
  commitAll: "writable",
}
