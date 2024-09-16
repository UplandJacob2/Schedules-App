const SchedulesSecure = {}


SchedulesSecure.verify = function verify(email, token) {
  if(!email) throw new Error('No email.')
  if(!SchedulesSecure.isValidEmail(email)) throw new Error('Bad email.')
  if(!token) throw new Error('No token.')
  if(!token.match(/[a-zA-Z0-9]{250}/g)) throw new Error('Bad token.')

  const file = DriveApp.getFolderById('1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc').getFilesByName('accounts.json').next()
  const accounts = JSON.parse(file.getBlob().getDataAsString())

  //const sc = CacheService.getScriptCache()
  //let accounts = JSON.parse(sc.get('SignInTokens'));

  const account = _.find(accounts, val => val.email.toLowerCase() === email.toLowerCase());
  if (!account) throw new Error('No account with that email.')
  return (account.token === token) 
}

SchedulesSecure.testDoc = function testDoc(str) {
  DocumentApp.openById('1NUtowdsYBC1Kq00xtr0VYsxnbbZBt8ROt01P1-EXeXo').getBody().setText(str);
}
/**
 * generate a 250 character using random.org
 */
SchedulesSecure.random250 = function random250() {
  let code = UrlFetchApp.fetch('https://www.random.org/strings/?num=10&len=25&digits=on&upperalpha=on&loweralpha=on&unique=on&format=html&rnd=new', {'muteHttpExceptions': true}).getContentText();
  return code.match(/([a-zA-Z0-9]{25})/g).join('')
}

SchedulesSecure.isValidEmail = function isValidEmail(email) {
  const re = /^(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*)@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)$/;
  // console.log(re.test(email) && /^(.){3,320}$/.test(email))
  return (re.test(email) && /^(.){3,320}$/.test(email))
}
SchedulesSecure.isValidPassword = function isValidPassword(pass) {
  return (
    /[0-9]/g.test(pass) && // must have #
    /[a-z]/g.test(pass) && // must have lowercase letter
    /[A-Z]/g.test(pass) && // must have uppercase letter
    /[^A-Za-z0-9]/g.test(pass) && // must have symbol
    _.size(pass) >= 8 // must be at least 8 characters
  )
}
