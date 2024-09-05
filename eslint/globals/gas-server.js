const globalsUsed = require("./globals")
module.exports = {
  ...globalsUsed,
  getSchedule: "writable",
  getDaysOff: "writable",
  confirmSignUp: "writable",
  signIn: "writable",
  signInWToken: "writable",
  doGet: "writable",
  include: "writable",
}
