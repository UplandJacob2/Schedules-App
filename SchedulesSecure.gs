var SchedulesSecure = SchedulesSecure || {}


SchedulesSecure.verify = function(email, token) {
  if (!email) {throw new Error('No email.');}
  if (!token) {throw new Error('No token.');}

  const file = DriveApp.getFolderById('1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc').getFilesByName('accounts.json').next()
  const accounts = JSON.parse(file.getBlob().getDataAsString())

  //const sc = CacheService.getScriptCache()
  //let accounts = JSON.parse(sc.get('SignInTokens'));
  let i = accounts.findIndex((val) => val.email.toLowerCase() == email.toLowerCase())
  if (i < 0) {// if we can't find an account with email
    if (!SchedulesSecure.isValidEmail(email)) {throw new Error('Bad email.');} // check if email is valid
    throw new Error('No account with that email.'); // if it is valid, but no account
  } else {
    if (accounts[i].token == token) {
      console.log('correct token'); return true
    } else {// if the token doesn't match
      if (!token || !token.match(/[a-zA-Z0-9]{250}/g)) {throw new Error('Bad token.');} // check if token is valid
      return false // is good token, but still wrong
    }
  }
}

SchedulesSecure.testDoc = function(str) {
  DocumentApp.openById('1NUtowdsYBC1Kq00xtr0VYsxnbbZBt8ROt01P1-EXeXo').getBody().setText(str);
}
/**
 * generate a 250 character using random.org
 */
SchedulesSecure.random250 = function() {
  let code = UrlFetchApp.fetch('https://www.random.org/strings/?num=10&len=25&digits=on&upperalpha=on&loweralpha=on&unique=on&format=html&rnd=new', {'muteHttpExceptions': true}).getContentText();
  return ''.concat(code.match(/([a-zA-Z0-9]{25})/g)).replace(/,/g, '');
}

SchedulesSecure.isValidEmail = function(email) {
  const re = /^(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*)@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)$/;
  console.log(re.test(email) && /^(.){3,320}$/.test(email))
  return (re.test(email) && /^(.){3,320}$/.test(email))
}
SchedulesSecure.isValidPassword = function(pass) {
  return (
    ((pass.match(/[0-9]/g) || []).length >= 1) &&   //must have #
    ((pass.match(/[a-z]/g) || []).length >= 1) &&   //must have lowercase letter
    ((pass.match(/[A-Z]/g) || []).length >= 1) &&   //must have uppercase letter
    ((pass.match(/[^A-Za-z0-9]/g) || []).length >= 1) && //must have symbol
    (pass.match(/(.){8,}/g))  // must be at least 8 characters
  )
}