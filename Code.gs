function doGet(q) {
  console.log(q);
  
  let doit;
  
  if (String(q.parameter.do) != "undefined") {doit = q.parameter.do;}
  else {return HtmlService.createHtmlOutput(HtmlService.createTemplateFromFile('notSignedIn').evaluate()).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).setTitle('Schedules').setFaviconUrl('https://i.imgur.com/hmLYiKm.png');}

  if (doit == "confirmSignUp") { var key = q.parameter.key;
    if (String(key) == 'undefined') {err('No key.');} 
    let json = JSON.parse(CacheService.getScriptCache().get(key));
    try {var [email, pass, passR] = [json.email, json.pass, json.passR];} catch {err('Bad key.');}

    
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
    api(q.parameter)
  }
}

function api (parameter) {
  if (!parameter.item){ err("Item required."); }
  let item = parameter.item
  if (item == 'sch') {
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
      return HtmlService.createHtmlOutput('done')

    } else if (action == 'edit') {
      if (!file) { err('file not found') }
      if (!parameter.val){ err('val required')}
      let {val} = parameter
      let fileSets = {title: email+'.json', mimeType: 'application/json'};
      let blob = Utilities.newBlob(val, "application/json");
      Drive.Files.update(fileSets, file.getId(), blob)
      return HtmlService.createHtmlOutput('done')

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
          fileToRecover.setTrashed(false)
          try {var nfile = DriveApp.getFolderById('1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc').getFilesByName(email+".json").next()}
          catch { w('no file for '+email); var nfile = null }
          return HtmlService.createHtmlOutput(nfile.getBlob().getDataAsString())
        } else if (onfail == "new") {
          DriveApp.getFolderById('1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc').createFile(email+'.json', '{"info":"s","class":"Some Class","b":"","days":""}')
          try {var nnfile = DriveApp.getFolderById('1_0tcWv6HmqFdN7sHeYAfM-gPkjE5btKc').getFilesByName(email+".json").next()}
          catch { w('no file for '+email); var nnfile = null }
          return HtmlService.createHtmlOutput(nnfile.getBlob().getDataAsString())
        } else if (onfail) {err('invalid onfail')
        } else if (fileToRecover) {err('file is trashed')}
      }
      l(data)
      return HtmlService.createHtmlOutput(data)
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
        return HtmlService.createHtmlOutput('done').setTitle('done')
      } else {
        return HtmlService.createHtmlOutput('can\'t recover file').setTitle('error')
      }
    }
  }
}


// when html templates are evaluated, this function is called to add scripts, style, etc. to the html
function include(filename) {return HtmlService.createHtmlOutputFromFile(filename).setSandboxMode(HtmlService.SandboxMode.IFRAME).getContent();}

function update(email, token) {
  if (SchedulesSecure.verify(email, token)) {
    const file = DriveApp.getFilesByName(email+"'s Schedules").next();
    //// TODO   remove call to second script
    const thing = UrlFetchApp.fetch(`https://script.google.com/a/macros/stu.evsck12.com/s/AKfycbwUAVQUqztZmh4u4uMCaSJxbTGcX3svhL64GbWUz8LLhvFZUq_PmaUgJAdHsdwWx4NZ/exec?do=update&email=${email}&id=${file.getId()}`, {'method': 'get', 'muteHttpExceptions': true, 'redirect': 'follow'});

    console.log(thing.getContentText());
  } else {err('Bad token.');}
}


function signUp (pass, passR, email) {
  console.log(pass+"   "+passR+"   "+email);
  if (!SchedulesSecure.isValidEmail(email)) {err("Invalid email. How do you get around client side checks?")}

  const sc = CacheService.getScriptCache()

  const i = JSON.parse(sc.get('SignInTokens')).findIndex((val) => val.email.toLowerCase() == email.toLowerCase())
  if (!(i < 0)) {err('Already an account with that email.')}
  // const sheet = SpreadsheetApp.open(DriveApp.getFilesByName("Schedules Accounts").next()).getActiveSheet();
  // const row = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues().findIndex((em) => em[0].toLowerCase() == email.toLowerCase()) + 1;
  // if (row > 0) {err('Already an account with that email.');}

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

function signIn (email, pass, rm) { var rand;
  const sheet = SpreadsheetApp.open(DriveApp.getFilesByName("Schedules Accounts").next()).getActiveSheet();
  const emails = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
  let row = emails.findIndex((em) => em[0].toLowerCase() == email.toLowerCase()) + 1;
  if (row <= 0) {err('No account with that email.')}

  if (sheet.getRange(row, 2).getValue() == pass) {
    console.log('correct password');
    if (rm) {
      rand = SchedulesSecure.random250()
      sheet.getRange(row, 3).setValue(rand);
    }
    let toReturn = new Array(getUserPage(email), rand);
    _refreshCache(); 
    return toReturn
  }
  else {err('Incorrect password.');}
}
function signInWToken(email, token) {
  if (!SchedulesSecure.verify(email, token)) {err('Bad token.');}
  console.log('correct token');
  const sheet = SpreadsheetApp.open(DriveApp.getFilesByName("Schedules Accounts").next()).getActiveSheet();
  let row = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues().findIndex((em) => em[0].toLowerCase() == email.toLowerCase()) + 1;
  
  rand = SchedulesSecure.random250();
  sheet.getRange(row, 3).setValue(rand);

  let toReturn = new Array(getUserPage(email), rand);
  _refreshCache(); 
  return toReturn
}


function getUserPage(email) {let toSpread, toReturn, doit;
  try {toSpread = SpreadsheetApp.openById("1Jp8EjZEzNERAp9OMr7NjM0Xl7epQLaE-P2xcLeDnl_U");}
  catch (e) {console.warn(e); try {toSpread = SpreadsheetApp.openById("1Jp8EjZEzNERAp9OMr7NjM0Xl7epQLaE-P2xcLeDnl_U");}
  catch (e) {if (!(e instanceof Error)) {e = new Error(e);} console.error(e.message);console.error('can\'t access \'toSpread\'');}}

  try {toSpread.getSheetByName(email); doit = 'show'} 
  catch {console.warn("no sheet for user"); doit = "askcreate";}   //ask the user to createNewSpread()}

  if (doit == 'show') {
    const signedInTxt = HtmlService.createTemplateFromFile('Index').getRawContent();
    //  TODO       edit schedule on main website - no need for Google Sheet
    const userScheduleURL = "https://docs.google.com/spreadsheets/d/"+UrlFetchApp.fetch('https://script.google.com/a/macros/stu.evsck12.com/s/AKfycbwUAVQUqztZmh4u4uMCaSJxbTGcX3svhL64GbWUz8LLhvFZUq_PmaUgJAdHsdwWx4NZ/exec?do=getUserSheet&email='+email, {'method': 'get', 'muteHttpExceptions': true, 'redirect': 'follow'}).getContentText().match(/(?<=<title>)(.){1,}(?=<\/title>)/g)[0]+"/edit";
    toReturn = signedInTxt.replace(/userScheduleURL/g, userScheduleURL) ;
  } else if (doit == 'askcreate') {
    var redirect = `https://script.google.com/macros/s/AKfycbwcF7nS-ct-h69R0lwgodlboPHH9MZN037uOqaQ7TAWHPQz1ExeNP4s1_Bf4EvtAIyU/exec?do=create&email=${email}`;
    toReturn = `<!DOCTYPE html><html><head><base target='_top'></head><body>  <style> body {font-family: 'Calibri';} header{font-size: 90px; padding: 40px;} a{font-size: 70px; background: #ddd; border: 1px solid #444; border-radius: 10px; padding: 30px; color: black; text-decoration: none;} a:hover{background: #999;}</style> <center><header>We couldn't find a schedule for you.</header></center>   <center><a href='${redirect}'>Create Schedule</a></center>    </body></html>`;
  } return toReturn
}

function _refreshCache() {
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
  emails.forEach((em, i) => {accounts[accounts.length] = {email: em[0], token: tokens[i][0]};})
  cacheSheet.getRange(1, 2).setValue(JSON.stringify(accounts));

  ////////////////////  from sheet to cache
  let keys = ['Schedules', 'SignInTokens'];
  let col1 = cacheSheet.getRange(1, 1, cacheSheet.getLastRow(), 1).getValues();
  let sc = CacheService.getScriptCache(); 
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

function _refreshSchedules() {
  const cacheSheet = SpreadsheetApp.open(DriveApp.getFilesByName("Schedules").next()).getSheetByName('Backup Cache');
  var schs = SchedulesSecure.getSchedules();
  cacheSheet.getRange(2, 2).setValue(JSON.stringify(schs));
  _refreshCache();
}


function getCurrentSchedule(email) {
  //const sheet = SpreadsheetApp.open(DriveApp.getFilesByName("Schedules").next()).getSheetByName('Backup Cache');
  //sheet.getRange(2, 2).setValue(JSON.stringify(SchedulesSecure.getSchedules()));  _refreshCache();

  let schs = JSON.parse(CacheService.getScriptCache().get('Schedules'));
  let schedules = schs[schs.findIndex((sch) => sch.email.toLowerCase() == email)].schedules;

  //l(schedules);
  for (let i = 0; i<=schedules.length-1; i++) {
    if (schedules[i][1][parseInt(new Date().getDay())]) {
      return SchedulesSecure.updateCurrentClass(schedules[i][0])
    }
  }

  //   if there's no schedule for today
  console.warn('no schedule today');
  return ['No Schedule Today']
}

function getSchedule(email, token) {
  if (!SchedulesSecure.verify(email, token)) {err('Bad token.');}

  let scheduleRange = [['Last Updated:', DateUtils.getDateAsText(), '', '', '', '', '', '']]; 
  let schedule = getCurrentSchedule(email);
  schedule.fromValues.forEach((r) => {scheduleRange[scheduleRange.length] = r;})
  // schedule.sHrs.forEach((sHr, i) => {scheduleRange[i+2][1] = sHr;});
  schedule.sMins.forEach((sMn, i) => {scheduleRange[i+2][3] = sMn;});
  // schedule.eHrs.forEach((eHr, i) => {scheduleRange[i+2][5] = eHr;});
  schedule.eMins.forEach((eMn, i) => {scheduleRange[i+2][7] = eMn;});
  l("range:    ", scheduleRange);

  
  var schStr = ''; var rab = 'a';
  scheduleRange.forEach((row, r) => {
    schStr+='<tr>'; 
    if (r == 0) {
      l(row[1])
      var date = String(row[1])
      schStr+='<td colspan="1">'+row[0]+'</td>'+'<td style="text-align: right;" colspan="7">'+date+' </td>';
    } else if (r == 1) {
      schStr+='<th colspan="8">'+row[0]+'</th>';
    } else {
      
      row.forEach((cell, c) => {
        schStr+='<td class="c'+c+' r'+rab;
        if (c == 0) {if (schedule.boldRows.includes(r+1)) {
          schStr+= ' b';
        }}
        if (schedule.classNow.includes(r-2)) {
          schStr+= ' y';
        }
        schStr+='">'+cell+'</td>';
      }); 
    }
    schStr+='</tr>';
    if (rab == "a") {rab = "b";} else {rab ="a";}
    });
  l(schStr);
  return schStr
}


var l = console.log
var w = console.warn
var e = console.error
function err(e) {throw new Error(e)}
