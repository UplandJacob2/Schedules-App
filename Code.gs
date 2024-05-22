function doGet(q) {
  console.log(q);
  
  let doit;
  
  if (String(q.parameter.do) != "undefined") {doit = q.parameter.do;}
  else {return HtmlService.createHtmlOutput(HtmlService.createTemplateFromFile('notSignedIn').evaluate()).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).setTitle('Schedules').setFaviconUrl('https://i.imgur.com/hmLYiKm.png');}

  if (doit == "confirmSignUp") { var key = q.parameter.key;
    if (String(key) == '') {err('No token.');} 
    let json = JSON.parse(CacheService.getScriptCache().get(key));
    try {var [email, pass, passR] = [json.email, json.pass, json.passR];} catch {err('Bad token.');}

    const sheet = SpreadsheetApp.open(DriveApp.getFilesByName("Schedules Accounts").next()).getActiveSheet();
    const row = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues().findIndex((em) => em[0].toLowerCase() == email.toLowerCase()) + 1;
    if (row > 0) {err('Already an account with that email.');}

    if (!SchedulesSecure.isValidEmail(email)) {err("Invalid email. How do you get around client side checks? And/or the server died?");}
    if (!SchedulesSecure.isValidPassword(pass)) {err("Invalid Password. How do you get around client side checks? And/or the server died?");}
    if (pass != passR) {err("Passwords don't match. How do you get around client side checks? And/or the server died?");}

    sheet.getRange(sheet.getLastRow()+1, 1).setValue(email);
    sheet.getRange(sheet.getLastRow(), 2).setValue(pass);

    return HtmlService.createHtmlOutput(HtmlService.createTemplateFromFile('confirmSignUp').evaluate()).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).setTitle('Schedules').setFaviconUrl('https://i.imgur.com/hmLYiKm.png');
  } else if (doit == 'api') {
    return HtmlService.createHtmlOutput(api(q.parameter))
  }
}

function api (parameter) {
  l(parameter)
  if (!parameter.item){ err("Item required."); }
  let item = parameter.item
  if (item == 'sch') {
    l('schedule data')
    if (!parameter.action) { err("Action required."); }
    if (!parameter.email) { err("Email required."); }
    if (!parameter.token) { err("Token required."); }
    let {action, email, token} = parameter
    try {if (!SchedulesSecure.verify(email, token)) {err('invalid token')}} catch(e) {err(e.message)}

    try {var file = DriveApp.getFolderById('1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc').getFilesByName(email+".json").next()}
    catch { w('no file for '+email); var file = null }
    
    if (action == 'delete'){
      if (!file) { err('file not found') }
      file.setTrashed(true)
      return 'done'

    } else if (action == 'edit') {
      if (!file) { err('file not found') }
      if (!parameter.val){ err('val required')}
      let {val} = parameter
      let fileSets = {title: email+'.json', mimeType: 'application/json'};
      let blob = Utilities.newBlob(val, "application/json");
      l('edit to '+val)
      Drive.Files.update(fileSets, file.getId(), blob)
      return 'done'

    } else if (action == 'get') {
      let data
      try {data = file.getBlob().getDataAsString()}
      catch { let onfail //////////////////   onfail
        if (parameter.onfail) {onfail = parameter.onfail}
        //////   if the file we are looking for is trashed
        let files = DriveApp.getTrashedFiles()
        let fileToRecover = null
        while (files.hasNext()){
          let f = files.next()
          if (f.getName() == email+".json"){
            fileToRecover = f
          }
        }
        if (onfail == 'recover'){
          if (fileToRecover) {
            fileToRecover.setTrashed(false)
            let nfile = DriveApp.getFolderById('1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc').getFilesByName(email+".json").next()
            return nfile.getBlob().getDataAsString()
          } else {
            err('No file to recover')
          }
        } else if (onfail == "new") {
          const firstRow = { info: 's', class: 'Some Class', strt: '', end: '', b: false, days: 'Mon, Wed, Fri', name: 'Schedule Name' }
          const emptyRow = { info: '',  class: 'Some Class', strt: '', end: '', b: false, days: '', name: '' }
          DriveApp.getFolderById('1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc').createFile(email+'.json', JSON.stringify([firstRow, emptyRow, emptyRow]))
          let nnfile = DriveApp.getFolderById('1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc').getFilesByName(email+".json").next()
          return nnfile.getBlob().getDataAsString()

        } else if (onfail) {err('invalid onfail')
        } else if (fileToRecover) {err('No active file found, but a trashed file was found for your account.')}
      }
      l(data)
      return data
    } else if (action == 'recover') {
      let files = DriveApp.getTrashedFiles()
      let fileToRecover = null
      while (files.hasNext()){
        let f = files.next()
        if (f.getName() == email+".json"){
          fileToRecover = f
        }
      }
      if (fileToRecover) {
        fileToRecover.setTrashed(false)
        return 'done'
      } else {
        err('can\'t recover file')
      }
    }
  }
}
//function test(str) {SchedulesSecure.testDoc(str)} // edit a Google Doc to whatever, can be called from the client for testing

// when html templates are evaluated, this function is called to add scripts, style, etc. to the html
function include(filename) {return HtmlService.createHtmlOutputFromFile(filename).setSandboxMode(HtmlService.SandboxMode.IFRAME).getContent();}

function signUp (pass, passR, email) {
  console.log(pass+"   "+passR+"   "+email);
  if (!SchedulesSecure.isValidEmail(email)) {err("Invalid email. How do you get around client side checks?")}
  const file = DriveApp.getFolderById('1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc').getFilesByName('accounts.json').next()
  const acctJson = JSON.parse(file.getBlob().getDataAsString())

  let i = acctJson.findIndex((em) => em.email[0].toLowerCase() == email.toLowerCase());
  if (i >= 0) {err('Already an account with that email.')}

  const sc = CacheService.getScriptCache()

  //const i = JSON.parse(sc.get('SignInTokens')).findIndex((val) => val.email.toLowerCase() == email.toLowerCase())
  //if (!(i < 0)) {err('Already an account with that email.')}

  if (!SchedulesSecure.isValidPassword(pass)) {err("Invalid Password. How do you get around client side checks?")}
  if (pass != passR) {err("Passwords don't match. How do you get around client side checks?")}
  const str = SchedulesSecure.random250();
  console.log(str);
  sc.put(str, JSON.stringify({pass: pass, email: email, passR: passR}));

  let htmlBody = HtmlService.createHtmlOutputFromFile('confirmSignUpEmail').getContent();
  const link = 'https://script.google.com/macros/s/AKfycbzw5nZW2BHmdvVJk0Ru3iRNBVS1Ku9K-NDX5Ncf2gkxyy0OF2ethzaeVwETLMZhrIVl2A/exec?do=confirmSignUp&key='+str;
  htmlBody = htmlBody.replace(/LINK/g, link);

  MailApp.sendEmail({
    to: email,
    subject: "Confirm your 'Schedules' account creation.",
    name: "Schedules App",
    htmlBody: htmlBody,
  });
}
function confirmSignUp(token) {
  if (String(token) == '') {err('No token.');} 
  let json = JSON.parse(CacheService.getScriptCache().get(token));
  try {var [email, pass, passR] = [json.email, json.pass, json.passR];} catch {err('Bad token.');}
  if (!SchedulesSecure.isValidEmail(email)) {err("Invalid email. How do you get around client side checks? And/or the server died?");}

  let file = DriveApp.getFolderById('1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc').getFilesByName('accounts.json').next()
  let data = JSON.parse(file.getBlob().getDataAsString())

  if (data.findIndex((r) => r.email == email) >= 0) {err('Already an account with that email.');}
  if (!SchedulesSecure.isValidPassword(pass)) {err("Invalid Password. How do you get around client side checks? And/or the server died?");}
  if (pass != passR) {err("Passwords don't match. How do you get around client side checks? And/or the server died?");}

  let ntoken = SchedulesSecure.random250()
  data.push({email: email, pass: pass, token: ntoken})

  let fileSets = {title: 'accounts.json', mimeType: 'application/json'};
  let blob = Utilities.newBlob(JSON.stringify(data), "application/json");
  l('edit to '+data)
  Drive.Files.update(fileSets, file.getId(), blob)

  return ntoken
}
function signIn (email, pass, rm) { let rand;
  const file = DriveApp.getFolderById('1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc').getFilesByName('accounts.json').next()
  const acctJson = JSON.parse(file.getBlob().getDataAsString())

  let i = acctJson.findIndex((acc) => acc.email.toLowerCase() == email.toLowerCase())
  if (i < 0) {err('No account with that email.')}

  if (acctJson[i].pass == pass) {
    console.log('correct password');
    if (rm) {
      rand = SchedulesSecure.random250()
      acctJson[i].token = rand

      let fileSets = {title: 'accounts.json', mimeType: 'application/json'};
      let blob = Utilities.newBlob(JSON.stringify(acctJson), "application/json");
      l('edit to '+blob)
      Drive.Files.update(fileSets, file.getId(), blob)
    }
    let toReturn = [HtmlService.createTemplateFromFile('Index').getRawContent(), rand];
    //_refreshCache(); 
    return toReturn
  }
  else {err('Incorrect password.');}
}
function signInWToken(email, token) {
  if (!SchedulesSecure.verify(email, token)) {err('Bad token.');}
  const file = DriveApp.getFolderById('1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc').getFilesByName('accounts.json').next()
  const acctJson = JSON.parse(file.getBlob().getDataAsString())

  let i = acctJson.findIndex((acc) => acc.email.toLowerCase() == email.toLowerCase())
  l(i)
  if (i < 0) {err('No account with that email.')}
  
  rand = SchedulesSecure.random250()
  acctJson[i].token = rand

  let fileSets = {title: 'accounts.json', mimeType: 'application/json'};
  let blob = Utilities.newBlob(JSON.stringify(acctJson), "application/json");
  l('edit to '+blob)
  Drive.Files.update(fileSets, file.getId(), blob)

  let toReturn = [HtmlService.createTemplateFromFile('Index').getRawContent(), rand];
  //_refreshCache(); 
  return toReturn
}

// NOT CURRENTLY USED may be reimplemented 
function _refreshCache() {
  const sc = CacheService.getScriptCache(); 
  const fold = DriveApp.getFolderById('1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc')
  const acctJson = JSON.parse(fold.getFilesByName('accounts.json').next().getBlob().getDataAsString())
  l(acctJson)
  let schInfo = []
  for (let acct in acctJson) {
    let iter = fold.getFilesByName(acctJson[acct].email+'.json'); let sch
    if (iter.hasNext()) {
      sch = iter.next().getBlob().getDataAsString()
    } else {
      w('file not found for: '+acctJson[acct].email)
    }
    l(sch)
    schInfo.push(sch)
  }


  const cacheSheet = SpreadsheetApp.open(DriveApp.getFilesByName("Schedules").next()).getSheetByName('Backup Cache');
  ////////////////////    schedules
  let schs = JSON.parse(cacheSheet.getRange(2, 2).getValue())
  l(schs)
  schs.forEach((gr, gri) => {
    gr.schedules.forEach((sc, sci) => {
      if (sci < gr.schedules.length-1) {schs[gri].schedules[sci][0] = SchedulesSecure.updateCurrentClass(sc[0]);}
    });
  });
  // l(schs[1].schedules[1][0]);
  cacheSheet.getRange(2, 2).setValue(JSON.stringify(schs));
  ////////////////////    accounts
  const accountSheet = SpreadsheetApp.open(DriveApp.getFilesByName('Schedules Accounts').next()).getSheetByName('Sheet1');
  let emails = accountSheet.getRange(1, 1, accountSheet.getLastRow(), 1).getValues();
  let tokens = accountSheet.getRange(1, 3, accountSheet.getLastRow(), 1).getValues();
  let accounts = new Array();
  emails.forEach((em, i) => { accounts.push({email: em[0], token: tokens[i][0]}) })
  cacheSheet.getRange(1, 2).setValue(JSON.stringify(accounts));

  ////////////////////  from sheet to cache
  let keys = ['Schedules', 'SignInTokens'];
  let col1 = cacheSheet.getRange(1, 1, cacheSheet.getLastRow(), 1).getValues();
  
  keys.forEach((key) => { 
    let row = col1.findIndex((em) => em[0] == key)+1;   let val;
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
function _refreshSchedules() {
  const cacheSheet = SpreadsheetApp.open(DriveApp.getFilesByName("Schedules").next()).getSheetByName('Backup Cache');
  var schs = SchedulesSecure.getSchedules();
  cacheSheet.getRange(2, 2).setValue(JSON.stringify(schs));
  _refreshCache();
}

function getSchedule(email, token, militaryTime) {
  try {if (!SchedulesSecure.verify(email, token)) {err('invalid token')}} catch(e) {err(e.message)}
  try {var file = DriveApp.getFolderById('1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc').getFilesByName(email+".json").next()}
  catch { w('no file for '+email); var file = null }
  if (!file) {return `<center><header style='font-size: 40px; margin: 30px;'>We couldn't find a schedule for you.</header></center>   <center><a onclick="toggleDisplay('editPop')" class='link' style='font-size: 25px; padding: 10px; margin-top: -30px;'>Create Schedule</a></center>`}
  let data = JSON.parse(file.getBlob().getDataAsString()); let schedule = []; let date = new Date()
  // get schedule for today
  for (let i in data) {
    if (data[i].info == 's') {
      if (data[i].days.toLowerCase().includes(DateUtils.numDayToStr(date.getDay()))) {
        let rInfo = data[i].info; let r = i
        while (rInfo != 'es') {
          schedule.push(data[r])
          r ++
          try { rInfo = data[r].info } catch {err('no end \'es\'')}
        }
        schedule.push(data[r])
      }
    }
  }

  let schStr = ''; let rab = 'a'
  schStr += '<tr><td colspan="1">Last Updated:</td><td style="text-align: right;" colspan="7">'+DateUtils.getDateAsText()+'</td></tr>'
  schStr += '<tr><th colspan="8">'+schedule[0].name+'</th></tr>'

  let classNows = []; let minu = String(date.getMinutes())
  if (minu.length == 1) { minu = '0'+minu }
  const nowInt = parseInt(String(date.getHours())+minu)
  let boldRows = []

  schedule.forEach((row, r) => {
    let strtTime = row.strt; let sHr = strtTime.split(':')[0]; let sMin = strtTime.split(':')[1]
    let endTime = row.end;   let eHr =  endTime.split(':')[0]; let eMin =  endTime.split(':')[1]
    const sInt = parseInt(sHr+sMin);  const eInt = parseInt(eHr+eMin)
    if (nowInt >= sInt && nowInt <= eInt) {
      classNows.push(row);
    }
    //if (!militaryTime) {strtTime = DateUtils.militaryToStandard(strtTime); endTime = DateUtils.militaryToStandard(endTime)}
    if (row.b) {boldRows.push(r)}
    schedule[r] = [row['class'], strtTime.split(':')[0], ':', strtTime.split(':')[1], '-', endTime.split(':')[0], ':', endTime.split(':')[1]]
  })
  schedule.forEach((row, r) => {
    schStr+='<tr>'
    l(row)
    row.forEach((cell, c) => {
      schStr+='<td class="c'+c+' r'+rab
      if (c == 0) {if (boldRows.includes(r)) {
        schStr+= ' b'
      }}
      
      if (classNows.includes(r-2)) {
        schStr+= ' y'
      }
      schStr+='">'+cell+'</td>'
    }); 
    
    schStr+='</tr>';
    if (rab == "a") { rab = "b" } else { rab ="a" }
  });
  l(schStr)
  return schStr
}


var l = console.log
var w = console.warn
var e = console.error
function err(e) {throw new Error(e)}
