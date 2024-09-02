const _ = Underscore.load()
const l = console.log
const w = console.warn
const e = console.error
function err_(e) { throw new Error(e) }


function doGet(q) {
  console.log(q);

  let doit;

  if (String(q.parameter.do) !== 'undefined') {
    doit = q.parameter.do;
  } else {
    return HtmlService.createHtmlOutput(
      HtmlService.createTemplateFromFile('notSignedIn').evaluate())
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .setTitle('Schedules').setFaviconUrl('https://i.imgur.com/hmLYiKm.png');
  }

  if (doit === 'confirmSignUp') {
    let key = q.parameter.key;
    if (String(key) === '') { err_('No token.'); }
    let json = JSON.parse(CacheService.getScriptCache().get(key)); let email, pass, passR
    try { [ email, pass, passR ] = [ json.email, json.pass, json.passR ]; } catch { err_('Bad token.'); }

    const sheet = SpreadsheetApp.open(DriveApp.getFilesByName('Schedules Accounts').next()).getActiveSheet();
    const row = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues().findIndex(em => em[0].toLowerCase() === email.toLowerCase()) + 1;
    if (row > 0) { err_('Already an account with that email.'); }

    if (!SchedulesSecure.isValidEmail(email)) { err_('Invalid email. How do you get around client side checks? And/or the server died?'); }
    if (!SchedulesSecure.isValidPassword(pass)) { err_('Invalid Password. How do you get around client side checks? And/or the server died?'); }
    if (pass !== passR) { err_('Passwords don\'t match. How do you get around client side checks? And/or the server died?'); }

    sheet.getRange(sheet.getLastRow()+1, 1).setValue(email);
    sheet.getRange(sheet.getLastRow(), 2).setValue(pass);

    return HtmlService.createHtmlOutput(HtmlService.createTemplateFromFile('confirmSignUp').evaluate()).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).setTitle('Schedules').setFaviconUrl('https://i.imgur.com/hmLYiKm.png');
  } else if (doit === 'api') {
    return HtmlService.createHtmlOutput(api(q.parameter))
  }
}

function api (parameter) {
  l(parameter)
  if (!parameter.item){ err_('Item required.'); }
  let item = parameter.item
  if (item === 'sch') {
    l('schedule data')
    if (!parameter.action) { err_('Action required.'); } if (!parameter.email) { err_('Email required.'); } if (!parameter.token) { err_('Token required.'); } let { action, email, token } = parameter
    try { if (!SchedulesSecure.verify(email, token)) { err_('invalid token') } } catch(e) { err_(e.message) } let file
    try { file = DriveApp.getFolderById('1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc').getFilesByName(`${email}.json`).next() } catch { w(`no file for ${email}`); file = null }

    if (action === 'delete'){
      if (!file) { err_('file not found') }
      file.setTrashed(true)
      return 'done'

    } else if (action === 'edit') {
      if (!file) { err_('file not found') }
      if (!parameter.val){ err_('val required') }
      let { val } = parameter
      let fileSets = { title: `${email}.json`, mimeType: 'application/json' };
      let blob = Utilities.newBlob(val, 'application/json');
      l(`edit to ${val}`)
      Drive.Files.update(fileSets, file.getId(), blob)
      return 'done'

    } else if (action === 'get') {
      let data
      try { data = file.getBlob().getDataAsString() }
      catch { let onfail //////////////////   onfail
        if (parameter.onfail) { onfail = parameter.onfail }
        //////   if the file we are looking for is trashed
        let files = DriveApp.getTrashedFiles()
        let filesToRecover = []
        while (files.hasNext()){
          let f = files.next()
          if (f.getName() === `${email}.json`){ //&& f.getParents().next().getId() === '1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc'){
            filesToRecover[filesToRecover.length] = f
          }
        }
        l(filesToRecover)
        if (onfail === 'recover'){
          l('# of files that can be recovered:', filesToRecover.length)
          if (parameter.fileId) {
            DriveApp.getFileById(parameter.fileId).setTrashed(false)
            let nfile = DriveApp.getFolderById('1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc').getFilesByName(`${email}.json`).next()
            return JSON.stringify([ 'File recovered', [[ nfile.getLastUpdated(), nfile.getBlob().getDataAsString(), nfile.getId() ]] ])
          }
          if (filesToRecover.length === 1) {
            l(filesToRecover[0])
            filesToRecover[0].setTrashed(false)
            let nfile = DriveApp.getFolderById('1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc').getFilesByName(`${email}.json`).next()
            return JSON.stringify([ 'File recovered', [[ nfile.getLastUpdated(), nfile.getBlob().getDataAsString(), nfile.getId() ]] ])
          } else if (filesToRecover.length > 1) {
            l('test')
            let a = [ 'More than one file can be recovered', filesToRecover.map(fl => [ fl.getLastUpdated(), fl.getBlob().getDataAsString(), fl.getId() ]) ]
            l(a)
            return JSON.stringify(a)
          } else {
            err_('No file to recover')
          }
        } else if (onfail === 'new') {
          const firstRow = { info: 's', class: 'Some Class', strt: '', end: '', b: false, days: 'Mon, Wed, Fri', name: 'Schedule Name' }
          const emptyRow = { info: '',  class: 'Some Class', strt: '', end: '', b: false, days: '', name: '' }
          DriveApp.getFolderById('1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc').createFile(`${email}.json`, JSON.stringify([ firstRow, emptyRow, emptyRow ]))
          let nnfile = DriveApp.getFolderById('1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc').getFilesByName(`${email}.json`).next()
          return nnfile.getBlob().getDataAsString()

        } else if (onfail) { err_('invalid onfail')
        } else if (filesToRecover) { err_('No active file found, but a trashed file was found for your account.') }
      }
      l(data)
      return data
    }
    // else if (action === 'recover') {
    //   let files = DriveApp.getTrashedFiles()
    //   let filesToRecover = []
    //   while (files.hasNext()){
    //     let f = files.next()
    //     if (f.getName() === `${email}.json`){ //&& f.getParents().next().getId() === '1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc'){
    //       filesToRecover[filesToRecover.length] = f
    //     }
    //   }
    //   if (filesToRecover.length === 1) {
    //     filesToRecover.setTrashed(false)
    //     return 'done'
    //   } else if (filesToRecover.length > 1) {
    //     return [ 'More than one file can be recovered', filesToRecover.map(fl => [ fl.getLastUpdated(), fl.getBlob().getDataAsString() ]) ]
    //   } else {
    //     err_('can\'t recover file')
    //   }
    // }
  } else if (item === 'settings') { /////////////////////////////////////////
    l('user settings')
    if (!parameter.action) { err_('Action required.'); } if (!parameter.email) { err_('Email required.'); } if (!parameter.token) { err_('Token required.'); } let { action, email, token } = parameter
    try { if (!SchedulesSecure.verify(email, token)) { err_('invalid token') } } catch(e) { err_(e.message) } let file
    try { file = DriveApp.getFolderById('1uWXjatjx8Gkm5Xv9bxxRRItfhTip0OmR').getFilesByName(`${email}_settings.json`).next() } catch { w(`no file for ${email}`); file = null }

    if (action === 'delete'){
      if (!file) { err_('file not found') }
      file.setTrashed(true)
      return 'done'

    } else if (action === 'edit') {
      if (!file) { err_('file not found') }
      if (!parameter.val){ err_('val required') }
      let { val } = parameter
      let fileSets = { title: `${email}_settings.json`, mimeType: 'application/json' };
      let blob = Utilities.newBlob(val, 'application/json');
      l(`edit to ${val}`)
      Drive.Files.update(fileSets, file.getId(), blob)
      return 'done'

    } else if (action === 'get') {
      let data
      try { data = file.getBlob().getDataAsString() }
      catch { let onfail //////////////////   onfail
        if (parameter.onfail) { onfail = parameter.onfail }
        //////   if the file we are looking for is trashed
        let files = DriveApp.getTrashedFiles()
        let filesToRecover = []
        while (files.hasNext()){
          let f = files.next()
          if (f.getName() === `${email}_settings.json`  ){ //&& f.getParents().next().getId() === '1uWXjatjx8Gkm5Xv9bxxRRItfhTip0OmR'){
            l(f.getParents().next().getId())
            filesToRecover[filesToRecover.length] = f
          }
        }
        l(filesToRecover)
        if (onfail === 'recover'){
          if (filesToRecover.length === 1) {
            filesToRecover[0].setTrashed(false)
            let nfile = DriveApp.getFolderById('1uWXjatjx8Gkm5Xv9bxxRRItfhTip0OmR').getFilesByName(`${email}_settings.json`).next()
            return nfile.getBlob().getDataAsString()
          } else if (filesToRecover.length > 1) {
            return [ 'More than one file can be recovered', filesToRecover.map(fl => [ fl.getLastUpdated(), fl.getBlob().getDataAsString() ]) ]
          } else {
            err_('No file to recover')
          }
        } else if (onfail === 'new') {
          const settingsBlank = { militaryTime: false, darkMode: false }
          DriveApp.getFolderById('1uWXjatjx8Gkm5Xv9bxxRRItfhTip0OmR').createFile(`${email}_settings.json`, JSON.stringify(settingsBlank))
          let nnfile = DriveApp.getFolderById('1uWXjatjx8Gkm5Xv9bxxRRItfhTip0OmR').getFilesByName(`${email}_settings.json`).next()
          return nnfile.getBlob().getDataAsString()

        } else if (onfail) { err_('invalid onfail')
        } else if (filesToRecover) { err_('No active file found, but a trashed file was found for your account.') }
      }
      l(data)
      return data
    } else if (action === 'recover') {
      let files = DriveApp.getTrashedFiles()
      let filesToRecover = []
      while (files.hasNext()){
        let f = files.next()
        if (f.getName() === `${email}_settings.json`){ //&& f.getParents().next().getId() === '1uWXjatjx8Gkm5Xv9bxxRRItfhTip0OmR'){
          filesToRecover[filesToRecover.length] = f
        }
      }
      if (filesToRecover.length === 1) {
        filesToRecover.setTrashed(false)
        return 'done'
      } else if (filesToRecover.length > 1) {
        return [ 'More than one file can be recovered', filesToRecover.map(fl => [ fl.getLastUpdated(), fl.getBlob().getDataAsString() ]) ]
      } else {
        err_('can\'t recover file')
      }
    }

  }
}
//function test(str) { SchedulesSecure.testDoc(str) } // edit a Google Doc to whatever, can be called from the client for testing

// when html templates are evaluated, this function is called to add scripts, style, etc. to the html
function include(filename) { return HtmlService.createHtmlOutputFromFile(filename).setSandboxMode(HtmlService.SandboxMode.IFRAME).getContent(); }

function signUp (pass, passR, email) {
  console.log(`${pass}   ${passR}   ${email}`);
  if (!SchedulesSecure.isValidEmail(email)) { err_('Invalid email. How do you get around client side checks?') }
  const file = DriveApp.getFolderById('1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc').getFilesByName('accounts.json').next()
  const acctJson = JSON.parse(file.getBlob().getDataAsString())

  let i = acctJson.findIndex(em => em.email[0].toLowerCase() === email.toLowerCase());
  if (i >= 0) { err_('Already an account with that email.') }

  const sc = CacheService.getScriptCache()

  //const i = JSON.parse(sc.get('SignInTokens')).findIndex(val => val.email.toLowerCase() === email.toLowerCase())
  //if (!(i < 0)) { err_('Already an account with that email.') }

  if (!SchedulesSecure.isValidPassword(pass)) { err_('Invalid Password. How do you get around client side checks?') }
  if (pass !== passR) { err_('Passwords don\'t match. How do you get around client side checks?') }
  const str = SchedulesSecure.random250();
  console.log(str);
  sc.put(str, JSON.stringify({ pass: pass, email: email, passR: passR }));

  let htmlBody = HtmlService.createHtmlOutputFromFile('confirmSignUpEmail').getContent();
  const link = `https://script.google.com/macros/s/AKfycbzw5nZW2BHmdvVJk0Ru3iRNBVS1Ku9K-NDX5Ncf2gkxyy0OF2ethzaeVwETLMZhrIVl2A/exec?do=confirmSignUp&key=${str}`;
  htmlBody = htmlBody.replace(/LINK/g, link);

  MailApp.sendEmail({
    to: email,
    subject: 'Confirm your \'Schedules\' account creation.',
    name: 'Schedules App',
    htmlBody: htmlBody,
  });
}
function confirmSignUp(token) {
  if (String(token) === '') { err_('No token.'); }  let json
  try { json = JSON.parse(CacheService.getScriptCache().get(token)); } catch { err_('Bad token.'); }

  let [ email, pass, passR ] = [ json.email, json.pass, json.passR ];
  if (!SchedulesSecure.isValidEmail(email)) { err_('Invalid email. How do you get around client side checks? And/or the server died?'); }


  let file = DriveApp.getFolderById('1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc').getFilesByName('accounts.json').next()
  let data = JSON.parse(file.getBlob().getDataAsString())

  if (data.findIndex(r => r.email === email) >= 0) { err_('Already an account with that email.'); }
  if (!SchedulesSecure.isValidPassword(pass)) { err_('Invalid Password. How do you get around client side checks? And/or the server died?'); }
  if (pass !== passR) { err_('Passwords don\'t match. How do you get around client side checks? And/or the server died?'); }

  let ntoken = SchedulesSecure.random250()
  data.push({ email: email, pass: pass, token: ntoken })

  let fileSets = { title: 'accounts.json', mimeType: 'application/json' };
  let blob = Utilities.newBlob(JSON.stringify(data), 'application/json');
  l(`edit to ${data}`)
  Drive.Files.update(fileSets, file.getId(), blob)

  return ntoken
}
function signIn (email, pass, rm) { let rand;
  const file = DriveApp.getFolderById('1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc').getFilesByName('accounts.json').next()
  const acctJson = JSON.parse(file.getBlob().getDataAsString())

  let i = acctJson.findIndex(acc => acc.email.toLowerCase() === email.toLowerCase())
  if (i < 0) { err_('No account with that email.') }

  if (acctJson[i].pass === pass) {
    console.log('correct password');
    if (rm) {
      rand = SchedulesSecure.random250()
      acctJson[i].token = rand

      let fileSets = { title: 'accounts.json', mimeType: 'application/json' };
      let blob = Utilities.newBlob(JSON.stringify(acctJson), 'application/json');
      l(`edit to ${blob}`)
      Drive.Files.update(fileSets, file.getId(), blob)
    }
    let toReturn = [ HtmlService.createTemplateFromFile('Index').getRawContent(), rand ];
    //refreshCache_();
    return toReturn
  }
  else { err_('Incorrect password.'); }
}
function signInWToken(email, token) {
  if (!SchedulesSecure.verify(email, token)) { err_('Bad token.'); }
  const file = DriveApp.getFolderById('1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc').getFilesByName('accounts.json').next()
  const acctJson = JSON.parse(file.getBlob().getDataAsString())

  let i = acctJson.findIndex(acc => acc.email.toLowerCase() === email.toLowerCase())
  l(i)
  if (i < 0) { err_('No account with that email.') }

  let rand = SchedulesSecure.random250()
  acctJson[i].token = rand

  let fileSets = { title: 'accounts.json', mimeType: 'application/json' };
  let blob = Utilities.newBlob(JSON.stringify(acctJson), 'application/json');
  l(`edit to ${blob}`)
  Drive.Files.update(fileSets, file.getId(), blob)

  let toReturn = [ HtmlService.createTemplateFromFile('Index').getRawContent(), rand ];
  //refreshCache_();
  return toReturn
}

// NOT CURRENTLY USED may be reimplemented
function refreshCache_() {
  const sc = CacheService.getScriptCache();
  const fold = DriveApp.getFolderById('1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc')
  const acctJson = JSON.parse(fold.getFilesByName('accounts.json').next().getBlob().getDataAsString())
  l(acctJson)
  let schInfo = []
  for (let acct in acctJson) {
    let iter = fold.getFilesByName(`${acctJson[acct].email}.json`); let sch
    if (iter.hasNext()) {
      sch = iter.next().getBlob().getDataAsString()
    } else {
      w(`file not found for: ${acctJson[acct].email}`)
    }
    l(sch)
    schInfo.push(sch)
  }


  const cacheSheet = SpreadsheetApp.open(DriveApp.getFilesByName('Schedules').next()).getSheetByName('Backup Cache');
  ////////////////////    schedules
  let schs = JSON.parse(cacheSheet.getRange(2, 2).getValue())
  l(schs)
  schs.forEach((gr, gri) => {
    gr.schedules.forEach((sc, sci) => {
      if (sci < gr.schedules.length-1) { schs[gri].schedules[sci][0] = SchedulesSecure.updateCurrentClass(sc[0]); }
    });
  });
  // l(schs[1].schedules[1][0]);
  cacheSheet.getRange(2, 2).setValue(JSON.stringify(schs));
  ////////////////////    accounts
  const accountSheet = SpreadsheetApp.open(DriveApp.getFilesByName('Schedules Accounts').next()).getSheetByName('Sheet1');
  let emails = accountSheet.getRange(1, 1, accountSheet.getLastRow(), 1).getValues();
  let tokens = accountSheet.getRange(1, 3, accountSheet.getLastRow(), 1).getValues();
  let accounts = new Array();
  emails.forEach((em, i) => { accounts.push({ email: em[0], token: tokens[i][0] }) })
  cacheSheet.getRange(1, 2).setValue(JSON.stringify(accounts));

  ////////////////////  from sheet to cache
  let keys = [ 'Schedules', 'SignInTokens' ];
  let col1 = cacheSheet.getRange(1, 1, cacheSheet.getLastRow(), 1).getValues();

  keys.forEach(key => {
    let row = col1.findIndex(em => em[0] === key)+1;   let val;
    if (sc.get(key)) {
      sc.remove(key);
    } else {
      w('cache got sad...');
    }
    val = cacheSheet.getRange(row, 2).getValue();
    sc.put(key, val);
  });
}
// NOT CURRENTLY USED may be reimplemented
function refreshSchedules_() {
  const cacheSheet = SpreadsheetApp.open(DriveApp.getFilesByName('Schedules').next()).getSheetByName('Backup Cache');
  let schs = SchedulesSecure.getSchedules();
  cacheSheet.getRange(2, 2).setValue(JSON.stringify(schs));
  refreshCache_();
}

function getSchedule(email, token) {
  let file
  try { if (!SchedulesSecure.verify(email, token)) { err_('invalid token') } } catch(e) { err_(e.message) }
  try { file = DriveApp.getFolderById('1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc').getFilesByName(`${email}.json`).next() }
  catch { w(`no file for ${email}`); file = null }
  if (!file) { return '<center><header style="font-size: 40px; margin: 30px;">We couldn\'t find a schedule for you.</header></center>   <center><a onclick="toggleDisplay(\'editPop\')" class="link" style="font-size: 25px; padding: 10px; margin-top: -30px;">Create Schedule</a></center>' }
  let data = JSON.parse(file.getBlob().getDataAsString()); let schedule = []; let date = new Date()
  // get schedule for today
  for (let i in data) {
    if (data[i].info === 's') {
      if (data[i].days.toLowerCase().includes(DateUtils.numDayToStr(date.getDay()))) {
        let rInfo = data[i].info; let r = i
        while (rInfo !== 'es') {
          schedule.push(data[r])
          r ++
          try { rInfo = data[r].info } catch { err_('no end \'es\'') }
        }
        schedule.push(data[r])
      }
    }
  }

  let schStr = ''; let rab = 'a'
  schStr += `<tr><td colspan="1">Last Updated:</td><td style="text-align: right;" colspan="7">${DateUtils.getDateAsText()}</td></tr>`
  schStr += `<tr><th colspan="8">${schedule[0].name}</th></tr>`

  let classNows = []; let minu = String(date.getMinutes())
  if (minu.length === 1) { minu =`0${minu}` }
  const nowInt = parseInt(String(date.getHours())+minu)
  let boldRows = []

  schedule.forEach((row, r) => {
    let strtTime = row.strt; let sHr = strtTime.split(':')[0]; let sMin = strtTime.split(':')[1]
    let endTime  = row.end;  let eHr =  endTime.split(':')[0]; let eMin =  endTime.split(':')[1]
    const sInt = parseInt(sHr+sMin);  const eInt = parseInt(eHr+eMin)
    if (nowInt >= sInt && nowInt <= eInt) {
      classNows.push(r);
    }
    l(classNows, sInt, eInt, nowInt)
    //if (!militaryTime) { strtTime = DateUtils.militaryToStandard(strtTime); endTime = DateUtils.militaryToStandard(endTime) }
    if (row.b) { boldRows.push(r) }
    schedule[r] = [ row['class'], strtTime.split(':')[0], ':', strtTime.split(':')[1], '-', endTime.split(':')[0], ':', endTime.split(':')[1] ]
  })
  schedule.forEach((row, r) => {
    schStr+='<tr>'
    l(row)
    row.forEach((cell, c) => {
      schStr+=`<td class="c${c} r${rab}`
      if (c === 0) { if (boldRows.includes(r)) { schStr+= ' b' } }
      if (classNows.includes(r)) { schStr+= ' y' }
      schStr+= `">${cell}</td>`
    });

    schStr+='</tr>';
    if (rab === 'a') { rab = 'b' } else { rab ='a' }
  });
  l(schStr)
  return schStr
}


