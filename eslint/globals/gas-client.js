const globalsUsed = require("./globals")
module.exports = {
  ...globalsUsed,
  google: "readonly",
  tui: "readonly",

  loadSheet: "writable",
  saveSettings: "writable",
  openMenu: "writable",

  SHEET: "writable",
  USER_SETTINGS: "writable",

  getToken: "writable",
  getEmail: "writable",
  setCookie: "writable",
  getCookie: "writable",
  deleteSignInCookies: "writable",

  jsonReparse: "writable",
  confirmPopup: "writable",
  resizeInput: "writable",
  toggleDisplay: "writable",
  error: "writable",

  signInF: "writable",
  signUp: "writable",
  signInSuccess: "writable",
  signOutBtn: "writable",
  deleteSch: "writable",
  editPopClose: "writable",

  checkSignUpButton: "writable",
  checkSignInButton: "writable",
  checkEmailBox: "writable",
  checkPassBox: "writable",
  showPassword: "writable",

  newSchedulesFail: "writable",
  getSchedulesSuccess: "writable",
  recoverSchedulesFail: "writable",
  recoverSchedulesSuccess: "writable",
  recoverSpecificSchedule: "writable",
}
