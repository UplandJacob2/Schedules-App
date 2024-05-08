var SchedulesSecure = SchedulesSecure || {}


SchedulesSecure.verify = function(email, token) {
  if (!email) {throw new Error('No email.');}
  if (!token) {throw new Error('No token.');}
  
  // const sheet = SpreadsheetApp.open(DriveApp.getFilesByName("Schedules Accounts").next()).getActiveSheet();
  // const emails = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
  // let row = emails.findIndex((em) => em[0].toLowerCase() == email.toLowerCase()) + 1;
  // if (row <= 0) {throw new Error('No account with that email.');}

  // if (sheet.getRange(row, 3).getValue() == token) {
  //   console.log('correct token'); return true
  // } else {return false}
  const sc = CacheService.getScriptCache()
  let accounts = JSON.parse(sc.get('SignInTokens'));
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
  let code = UrlFetchApp.fetch('https://www.random.org/strings/?num=10&len=25&digits=on&upperalpha=on&loweralpha=on&unique=on&format=html&rnd=new').getContentText();
  return "".concat(code.match(/([a-zA-Z0-9]{25})/g)).replace(/,/g, "");
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
/**
 * updates the values to tell the script what events are active
 * 
 * @param{schedule}: schedule
 * @return{schedule}: schedule with updated values
 */
SchedulesSecure.updateCurrentClass = function(schedule) {let classNows = new Array(); 
  let hour = String(Utilities.formatDate(new Date(), "CST", "HH")); let minu = String(Utilities.formatDate(new Date(), "CST", "mm"));
  const nowInt = parseInt(hour+minu); let lastHr;  schedule.hour = hour;    schedule.minu = minu;
  for (let clas = 0; clas <= schedule.numRows-2; clas++) {// loop through each class
    let sHr = parseInt(schedule.sHrs[clas]);  if (sHr < lastHr) {sHr += 12;}if (String(sHr).length == 1) {sHr = "0"+sHr;}
    let eHr = parseInt(schedule.eHrs[clas]);  if (eHr < sHr) {eHr += 12;}   if (String(eHr).length == 1) {eHr = "0"+eHr;}
    let sMin = parseInt(schedule.sMins[clas]); if (String(sMin).length == 1){sMin = "0"+sMin;}
    let eMin = parseInt(schedule.eMins[clas]); if (String(eMin).length == 1){eMin = "0"+eMin;}
    const sInt = parseInt(String(sHr)+sMin);  const eInt = parseInt(String(eHr)+eMin);  
    if (nowInt >= sInt && nowInt <= eInt) {
      classNows[classNows.length] = clas;
    }
    schedule.sHrs[clas] = sHr;   schedule.sMins[clas] = sMin;
    schedule.eHrs[clas] = eHr;   schedule.eMins[clas] = eMin;
    schedule.fromRange
    lastHr = eHr
  } schedule.classNow = classNows; return schedule
}

//   TODO   get schedules from json files in Google Drive instaed of Google Sheets
SchedulesSecure.getSchedules = function() {
  try {var fromSpread = SpreadsheetApp.openById("1UQXkW-jN_6WR4UqQNXLcsjvpNvluj018ziRL2JV-8Fc");}
  catch (e) {console.error('fromSpread is sad, waiting to try to access again.'+e); try {Utilities.sleep(10000); console.warn('trying again');
    var fromSpread = SpreadsheetApp.openById("1UQXkW-jN_6WR4UqQNXLcsjvpNvluj018ziRL2JV-8Fc");}
  catch (e) {if (!(e instanceof Error)) {e = new Error(e);} console.error(e.message);throw new Error('can\'t access \'fromSpread\'');}}
  const aFSheet = fromSpread.getSheetByName("All Schedules");

  Logger.log('--  --  getting schedules...');
  const colVals = aFSheet.getRange(1, 1,  aFSheet.getLastRow()).getValues();
  let groupSs = new Array();  let groupEs = new Array();  let schSs = new Array();  let schEs = new Array(); let userEmails = new Array(); let dayFilters = new Array();
  let lastVal;
  for (let count = 1; count <= colVals.length; count++) {
    var val = colVals[count-1][0]; 
    if (val == 's' || val == 'es' || val == 'g' || val == 'eg') {
      //console.log(val+'     '+lastVal)
      if (val == "g") {
        if (lastVal && lastVal != 'eg' && lastVal != 'ss') {
          console.warn('oop');
          groupEs[groupEs.length] = count;
        }
        groupSs[groupSs.length] = count;  
        userEmails[userEmails.length] = aFSheet.getRange(count, 2).getValue(); 
      } else 
      if (val == "s"){
        if (lastVal && !(lastVal == 'es' || lastVal == 'g')) {
          console.warn('oop');
          schEs[schEs.length] = count;
        }
        schSs[schSs.length] = count;
        dayFilters[dayFilters.length] = aFSheet.getRange(count, 11, 1, 7).getValues()[0];
      } else 
      if (val == "es") {schEs[schEs.length] = count;} else 
      if (val == "eg") {groupEs[groupEs.length] = count;}
      lastVal = val;
    }
  }
  if (groupSs.length > groupEs.length) {console.error("No end to a schedule group.");return} 
  else if (groupSs.length < groupEs.length) {console.error("No beginning to a schedule group.");return}
  if (schSs.length > schEs.length) {console.error("No end to a schedule.");return} 
  else if (schSs.length < schEs.length) {console.error("No beginning to a schedule.");return}
  /*
  Logger.log(groupSs);
  Logger.log(groupEs);
  Logger.log(schSs);
  Logger.log(schEs);
  //*/
  let allGroups = new Array();
  for (let group=0; group <= groupSs.length-1; group++) {
    allGroups[group] = new scheduleGroup(userEmails[group]);
    for(let sch = 0; sch <= schSs.length; sch++) {
      if (schSs[sch]>groupSs[group] && schSs[sch]<groupEs[group]) {
        let scheduley = new schedule(schSs[sch], 2, schEs[sch]-schSs[sch]+1, 8, aFSheet, 2, 1, toSpread.getSheetByName(userEmails[group]), aFSheet.getRange(schSs[sch], 2).getValue());

        for (let row = scheduley.sRow; row <= scheduley.sRow+scheduley.numRows; row++) {
          if (String(aFSheet.getRange(row, 10, 1, 1).getValues()) == "b") {
            scheduley.addBoldClass(row-scheduley.sRow);
          }
        }
        const dfs = dayFilters[sch]
        allGroups[group].addScheduleToGroup(scheduley)
          .addDayFilter(aFSheet.getRange(schSs[sch], 2).getValue(), dfs[0], dfs[1], dfs[2], dfs[3], dfs[4], dfs[5], dfs[6]);
        if (!scheduley.fromValues[0][0]) {console.warn("empty schedule name");}
      }
    }
  } Logger.log('--  --  done');
  return allGroups
}


class schedule {
  constructor(sRow, sCol, numRows, numCols, fromSheet, toSRow, toSCol, toSheet, name) {
    this.sRow = sRow; this.sCol = sCol; this.numRows = numRows; this.numCols = numCols; this.toSRow = toSRow; this.toSCol = toSCol; this.toSheet = toSheet; this.name = name; this.boldRows = new Array(); this.fromValues = fromSheet.getRange(sRow, sCol, numRows, numCols).getValues();

    this.classes = fromSheet.getRange(sRow+1, sCol, numRows-1, 1).getValues();
    this.sHrs = fromSheet.getRange(sRow+1, sCol+1, numRows-1, 1).getValues();
    this.sMins = fromSheet.getRange(sRow+1, sCol+3, numRows-1, 1).getValues();
    this.eHrs = fromSheet.getRange(sRow+1, sCol+5, numRows-1, 1).getValues();
    this.eMins = fromSheet.getRange(sRow+1, sCol+7, numRows-1, 1).getValues();

    this.date = new Date();  this.hour = Intl.DateTimeFormat('en', {hour: 'numeric', hour12: false,}).format(this.date);   this.minu = parseInt(Utilities.formatDate(this.date, "CST", "mm"));

    this.classNow = new Array();   this.updateCurrentClass();
    
    for (let i = 1; i<= this.sHrs.length; i++) {
      if (parseInt(this.sHrs[i]) < parseInt(this.sHrs[i-1])) {// if the previous class's hour was < this class's, this class is PM
        this.sHrs[i] = parseInt(this.sHrs[i])+12; // add 12 to the hour to make is military time
      }
      if (parseInt(this.eHrs[i]) < parseInt(this.eHrs[i-1])) {// same here
        this.eHrs[i] = parseInt(this.eHrs[i])+12;
      }
    }
  }
  backPattern() {
    for (let row = this.toSRow+1; row <= this.toSRow + this.numRows-1; row = row+2) {
      this.toSheet.getRange(row, 1, 1, 8).setBackgroundRGB(217, 217, 217);// dark gray
      if (row+1 <= parseInt(this.toSRow)+parseInt(this.numRows)-1) {// check if there is a next row to make light gray
        this.toSheet.getRange(row+1, 1, 1, 8).setBackgroundRGB(243, 243, 243);// light gray
      }
    } return this
  }
  logSchedule() {
    l(this);
    l(this.fromValues);
    l("classes: ");   l(this.classes);
    l("start hrs: "); l(this.sHrs);
    l("start mins: ");l(this.sMins);
    l("end hrs: ");   l(this.eHrs);
    l("end mins: ");  l(this.eMins);
  }
  highlightClassNow() {
    for (let clas = 0; clas <= this.numRows-2; clas++) {// loop through each class
      const sHr = parseInt(this.sHrs[clas]); const eHr = parseInt(this.eHrs[clas]); const sMin = parseInt(this.sMins[clas]); const eMin = parseInt(this.eMins[clas]);
      if ((sHr == eHr && this.hour == sHr && this.hour == eHr && this.minu >= sMin && this.minu <= eMin) || 
          (sHr != eHr && ((this.hour == sHr && this.minu >= sMin) || (this.hour == eHr && this.minu <= eMin) || (this.hour > sHr && this.hour < eHr)))) {
        this.toSheet.getRange(clas+this.toSRow+1, 1, 1, 8).setBackground("#ffff00");// hightlight the current class yellow
      }
    } return this
  }
  updateCurrentClass() {let classNows = new Array();
    const nowInt = parseInt(String(this.hour)+String(this.minu)); let lastHr;
    for (let clas = 0; clas <= this.numRows-2; clas++) {// loop through each class
      let sHr = parseInt(this.sHrs[clas]); if (sHr < lastHr) {sHr += 12;} let eHr = parseInt(this.eHrs[clas]); if (eHr < sHr) {eHr += 12;}
      const sMin = this.sMins[clas];   const eMin = this.eMins[clas];
      const sInt = parseInt(String(sHr)+sMin);  const eInt = parseInt(String(eHr)+eMin);  
      if (nowInt >= sInt && nowInt <= eInt) {
        classNows[classNows.length] = clas;
      }
      lastHr = eHr
    } this.classNow = classNows;  return this
  }
  addBoldClass(row) {
    this.boldRows[this.boldRows.length] = row+this.toSRow; return this
  }
  updateSchedule() {
    const toRange = this.toSheet.getRange(this.toSRow, this.toSCol, this.numRows, this.numCols).setNumberFormat('@');
    try{this.toSheet.deleteRows(3, this.toSheet.getMaxRows()-2);}     //clear the place
    catch{console.warn('oop nothing to delete');}
    //console.warn(toRange.getValues());
    this.toSheet.insertRowsAfter(this.toSheet.getMaxRows(), this.numRows-this.toSheet.getMaxRows());// add the rows needed for the schedule
    toRange.setNumberFormat('@');

    let aligns = new Array(8); aligns = ['left', 'right', 'center', 'left', 'center', 'right', 'center', 'left'];// horizontal alignments
    let widths = new Array(8); widths = [220, 50, 25, 50, 25, 50, 25, 50]     // comlumn widths
    for (let col = 1; col <= 8; col++) {     //   set them
      this.toSheet.getRange(this.toSRow+1, col, this.numRows-1, 1).setHorizontalAlignment(aligns[col-1]);
      this.toSheet.setColumnWidths(col, 1, widths[col-1]);
    } 
    

    this.backPattern();// make the stipped background pattern
    this.highlightClassNow();// highlight in yellow class you are currently in

    toRange.setValues(this.fromValues).setBorder(true, true, true, true, false, true).setFontWeight('normal');  // PASTE THE SCHEDULE
    //console.log(this.fromValues);
    
    let boldA = 0;
    for (let row = this.toSRow; row <= this.toSRow + this.numRows; row++){//make the correct rows bold
      if (this.boldRows[boldA] == row) {
        this.toSheet.getRange(row, this.toSCol, 1, 1).setFontWeight('bold'); boldA +=1;//  bold
      } else {this.toSheet.getRange(row, this.toSCol, 1, 1).setFontWeight('normal');}// resets things that shouldn't be bold
    }


    //try{this.toSheet.deleteRows(this.toSheet.getLastRow()+1, this.toSheet.getMaxRows()-(this.toSRow+this.numRows-1));}  // clear extra rows
    //catch{this.toSheet.deleteRows(this.toSheet.getLastRow()+1, this.toSheet.getMaxRows()-(this.toSRow+this.numRows-1));}// try again
    this.toSheet.setRowHeights(1, this.toSheet.getMaxRows(), 42);
    toRange.setFontSize(20).setVerticalAlignment('middle');

    if (this.toSheet.getMaxColumns() > 9) {this.toSheet.deleteColumns(9, this.toSheet.getMaxColumns()-8);}// if there are extra columns, delete them

    
    const dateTxt = DateUtils.getDateAsText();    console.log(dateTxt);

    this.toSheet.getRange(1,1,1,8).setFontSize(20).setHorizontalAlignment('left').setVerticalAlignment('middle').setBackground('#f3f3f3').setBorder(true,true,true,true,true,true);//first row
    this.toSheet.getRange(1, 1).setValue('Last Updated:'); 
    this.toSheet.getRange(1, 2, 1, 7).merge().setValue(dateTxt); //date cell

    this.toSheet.getRange(this.toSRow, 1, 1, 8).merge().setBackground('#6fa8dc').setHorizontalAlignment('center').setFontWeight('bold'); // title cell

    this.toSheet.deleteRow(this.toSheet.getLastRow()+1);
    return this
  }
  up () {// simple update
    const dateTxt = DateUtils.getDateAsText();      console.log(dateTxt);
    this.toSheet.getRange(1, 2, 1, 7).merge().setValue(dateTxt); /////    date cell 

    this.backPattern().highlightClassNow();
  }
}
try {var toSpread = SpreadsheetApp.openById("1Jp8EjZEzNERAp9OMr7NjM0Xl7epQLaE-P2xcLeDnl_U");}
catch (e) {console.error('toSpread is sad, waiting to try to access again.'+e); try {Utilities.sleep(10000); console.warn('trying again');
  var toSpread = SpreadsheetApp.openById("1Jp8EjZEzNERAp9OMr7NjM0Xl7epQLaE-P2xcLeDnl_U");}
catch (e) {if (!(e instanceof Error)) {e = new Error(e);} console.error(e.message);throw new Error('can\'t access \'toSpread\'');}}
class scheduleGroup {
  constructor(email) {
    this.schedules = new Array(1);
    this.date = new Date();
    this.day = this.date.getDay();
    this.email = email;
    this.toSheet = toSpread.getSheetByName(this.email);
  }
  addScheduleToGroup(schedule) {
    this.schedules[this.schedules.length-1] = new Array(3);// find the open array in the last slot of the array to put the shedule
    this.schedules[this.schedules.length-1][0] = schedule;// put it there
    this.schedules[this.schedules.length] = new Array(3);// create and empty array in the last slot to be ready for the next schedule
    return this
  }
  getByName(name) {
    for (let i = 0; i<=this.schedules.length-1; i++) {
      if (this.schedules[i][0].name == name) {
        return this.schedules[i];
      }
    }
    console.error("no schedule with the name \"" + name + "\"");
  }
  addDayFilter(scheduleName, d0, d1, d2, d3, d4, d5, d6) {// which days the schedule should be shown for (d0:mon, d1:tues, etc)
    for (let i = 0; i<=this.schedules.length-1; i++) {
      if (this.schedules[i][0].name == scheduleName) {
        this.schedules[i][1] = new Array(7);// put the true/false values in the array for the given schedule
        this.schedules[i][1][0] = d0;this.schedules[i][1][1] = d1;this.schedules[i][1][2] = d2;
        this.schedules[i][1][3] = d3;this.schedules[i][1][4] = d4;this.schedules[i][1][5] = d5;this.schedules[i][1][6] = d6;
        return this
      }
    }
  }
  updateScheduleGroup() {
    for (let i = 0; i<=this.schedules.length-2; i++) {
      //console.warn(this.schedules[i][0].name);
      if (this.schedules[i][1][parseInt(this.day)]) {
        //console.warn(this.schedules[i][0].name);
        this.schedules[i][0].updateSchedule();
        return this
      }
    }
    //   if there's no schedule for today
    this.toSheet.getRange(2, 1).setValue('No schedule today'); console.warn('no schedule today'); //display 'no schedule'
    this.toSheet.deleteRows(3, this.toSheet.getLastRow()-2);    //    delete extra garbo
  }

  smallUpdateGroup() {
    for (let i = 0; i<=this.schedules.length-2; i++) {
      //console.warn(this.schedules[i][0].name);
      if (this.schedules[i][1][parseInt(this.day)]) {
        //console.warn(this.schedules[i][0].name);
        this.schedules[i][0].up();
        return this
      } 
    } // if there ire no schedule - still update date box:
    
    const dateTxt = DateUtils.getDateAsText();      console.log(dateTxt);
    this.toSheet.getRange(1, 2, 1, 7).merge().setValue(dateTxt); /////    date cell 
  }
}


