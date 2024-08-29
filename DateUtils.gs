var DateUtils = DateUtils || {};
/**
 * Returns all formated (month/day/year) days ranging from one input to the other
 *
 * inputs:
 * * {string} first date
 *
 * * {string} second date
 *
 * * {bool} is formated -
 *   * false: Month(3 char) day(2 dig), year(4 dig)
 *     * ex: 'Feb 19, 2024'
 *   * true: month(1 or 2 dig)/day(1 or 2 dig)/year(4 dig)
 *     * ex: '2/19/2024'
 *
 * returned:
 * {string[]} list of dates formated as month/day/year
 *
 * @param {string} first date
 * @param {string} second date
 * @param {bool} is formated
 * @return {string[]} list of dates formated as month/day/year
 */
DateUtils.dayRange = function (fromD, toD, formated) { let daysPerMonth
  if (DateUtils.isLeapYear()) { daysPerMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  } else { daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; }
  let month, day, year, eMonth, eDay, eYear, found;
  l('day range', fromD, toD, formated)

  if (formated) {
    month = parseInt(fromD.match(/^[0-9]{1,2}(?=\/)/g)[0]); day = parseInt(fromD.match(/(?<=\/)[0-9]{1,2}(?=\/)/g)[0]); year = parseInt(fromD.match(/(?<=\/)[0-9]{4}/g)[0]);
    eMonth =parseInt(  toD.match(/^[0-9]{1,2}(?=\/)/g)[0]);eDay = parseInt(  toD.match(/(?<=\/)[0-9]{1,2}(?=\/)/g)[0]);eYear = parseInt(  toD.match(/(?<=\/)[0-9]{4}/g)[0]);
  } else {
    month = DateUtils.monthToNum(fromD.match(/(\D){3}(?= )/g)[0]);   day = fromD.match(/[0-9]{2}(?=, )/g)[0];   year = fromD.match(/[0-9]{4}/g)[0];
    eMonth =  DateUtils.monthToNum(toD.match(/(\D){3}(?= )/g)[0]);   eDay=parseInt(toD.match(/[0-9]{2}(?=, )/g)[0]);   eYear =  toD.match(/[0-9]{4}/g)[0];
  }
  l(year, eYear)
  if (eYear < year) {
    year = year - 1
  }
  let daysToReturn = new Array();  let daysInMonth = daysPerMonth[month-1];
  //console.log(month+'/'+day+'/'+year);
  //console.log(eMonth+'/'+eDay+'/'+eYear);

  while (!found) {
    l(month, day, year)
    //month = parseInt(month); day = parseInt(day); year = parseInt(year)
    daysInMonth = daysPerMonth[month-1];
    if (month <= 12) {
      //console.log(month+'/'+day+'/'+year);
      daysToReturn[daysToReturn.length] = `${month}/${day}/${year}`;
      if (`${month}/${day}/${year}` === `${eMonth}/${eDay}/${eYear}`) {
        return daysToReturn
      }
      if (day < daysInMonth) {  day++;
      } else { day = 1; month ++; }
    } else { year ++; month = 1; }
  }
}
/**
 * Returns 1 formated (month/day/year) date offset the inputed # of days from the input
 *
 * inputs:
 * * {string} first date
 *
 * * {number} # of days to be offset - can be negative
 *
 * returned:
 * {string} date formated as month/day/year
 *
 * @param {string} first date
 * @param {number} offset
 * @return {string} date formated as month/day/year
 */
DateUtils.iterateDays = function (fromD, num) { let daysPerMonth
  if (DateUtils.isLeapYear()) { daysPerMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  } else { daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];}
  l('iterating through days')
  //l('from date: ', fromD)

  let year = fromD.match(/[0-9]{4}/g)[0]; let month = DateUtils.monthToNum(fromD.match(/(\D){3}(?= )/g)[0]); let daysInMonth = daysPerMonth[month-1]; let day = fromD.match(/[0-9]{2}(?=, )/g);
  if (num > 0 ) {
    for (let i=0; i < num; i++) {
      daysInMonth = daysPerMonth[month-1];
      if (month <= 12) {
        if (day < daysInMonth) { day++; } else { day = 1; month ++; }
      } else { year ++; month = 1; }
    }
    return `${month}/${day}/${year}`
  } else if (num < 0) {
    for (let i=0; i > num; i--) {
      daysInMonth = daysPerMonth[month-1];
      if (month <= 12) {
        if (day < daysInMonth) { day--; } else { day = 1; month --; }
      } else { year --; month = 1; }
    }
    return `${month}/${day}/${year}`;
  } else { return `${month}/${day}/${year}`; }
}
/**
 * Returns true if this year is a leap year
 *
 * returned:
 * {bool} is leap year
 *
 * @return {bool} is leap year
 */
DateUtils.isLeapYear = function () { const d = new Date().getFullYear(); /*d = 2100; */  return ((d % 4 === 0) && ((d / 100 !== 0) || (d / 400 === 0)))}
/**
 * Returns today formated: month/day/year
 *  * ex: 1/5/2024
 *
 * returned:
 * {string} today's date
 *
 * @return {string} today's date
 */
DateUtils.today = function () {
  const day = new Date();
  return `${day.getMonth()+1}/${day.getDate()}/${day.getFullYear()}`;
}
/**
 * Returns day of week as num: 0-6
 *
 * inputs:
 * * {string} month (3 char)
 *   * ex 'feb'
 *
 * returned:
 * {string} number for month
 *   * ex: 2
 *
 * @param {string} month
 *
 * @return {string} number for month
 */
DateUtils.monthToNum = function (str) {
  str = str.toLowerCase(); let ans;
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  months.forEach((month, i)=> {if (month === str) {ans = i + 1;}});
  return ans
}
/**
 * Returns day of week as 3 letters: sun, mon, tue, wed, thu, fri, sat
 *
 * inputs:
 * * {int} day
 *
 * returned: day as string
 * {string}
 *   * ex: 'mon'
 *
 * @param {int} day as int
 *
 * @return {string} day as string
 */
DateUtils.numDayToStr = function (num) {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  return days[num]
}


DateUtils.militaryToStandard = function(time) {
  time = time.split(':'); // convert to array
  let hours = Number(time[0]);
  let minutes = Number(time[1]);
  let timeValue;

  if (hours > 0 && hours <= 12) {
    timeValue = '' + hours;
  } else if (hours > 12) {
    timeValue = '' + (hours - 12);
  } else if (hours === 0) {
    timeValue = '12';
  }
  timeValue += (minutes < 10) ? ':0' + minutes : ':' + minutes;  // get minutes
  //timeValue += (hours >= 12) ? ' PM' : ' AM';  // get AM/PM
  return timeValue
}

/**
 * Returnes current date and time as a string
 *
 * Returned:
 * {string} current date and time as a string formatted: month/day/year hr:min:sec
 *  * ex: 02/10/2024 18:10:54
 *
 * @return {string} current date and time
*/
DateUtils.getDateAsText = function () {
  return Utilities.formatDate(new Date(), 'CST', 'MM/dd/yyyy HH:mm:ss')
}





/**
 * Returns list of days with no school in EVSC - formated: month/day/year
 *
 * inputs:
 * * {bool} returnListOfReasons
 *
 * returned:
 * {string[]} list of days
 *   * if 'returnListOfReasons' is true: list with list of days and list of reasons
 *
 * @param {bool}
 *
 * @return {string[]}
 */
function getDaysOff(returnListOfReasons) {
  const feed = 'https://district.evscschools.com/syndication/rss.aspx?serverid=74688&userid=5&feed=portalcalendarevents&key=AldG6kAOC9I2Zqbatkslk0yAX9ddipkQPpCdFDbupJGi1SVEK7IS9vWmI53h058bbTRRdB8qA8cAq4FQMyjbVA%3d%3d&portal_id=74772&page_id=74794&calendar_context_id=82481&portlet_instance_id=12393&calendar_id=82482&v=2.0'; let txt

  try  {txt = UrlFetchApp.fetch(feed, {'muteHttpExceptions': true, 'redirect': 'follow'}).getContentText();}
  catch{Utilities.sleep(1000); txt = UrlFetchApp.fetch(feed, {'muteHttpExceptions': true, 'redirect': 'follow'}).getContentText();}
  //l(txt);

  let daysoff = new Array();   let lastDay, firstDay;   let items = new Array();

  const itemElms = XmlService.parse(txt).getAllContent()[0].asElement().getChild('channel').getChildren('item');

  itemElms.forEach(item=> {
    if (item.getChildText('title').match(/No School/g)) {
      items[items.length] = new Array();
      items[items.length-1][0] = item.getChildText('title');
      items[items.length-1][1] = item.getChildText('description').match(/(.){3} [0-9]{2}, [0-9]{4}/g);
    } else if (item.getChildText('title').match(/End of 4th Grading Period\/2nd Semester/g)) {
      lastDay = item.getChildText('description').match(/(.){3} [0-9]{2}, [0-9]{4}/g)[0];
      l(item.getChildText('description'))
    } else if (item.getChildText('title').match(/Students with Last Names A-J in Attendance/g)) {
      firstDay = item.getChildText('description').match(/(.){3} [0-9]{2}, [0-9]{4}/g)[0];
    }
  });
  let summer, eSummer;
  if (firstDay && lastDay) {
    summer = DateUtils.iterateDays(lastDay, 1);  eSummer = DateUtils.iterateDays(firstDay, -1);  // get first and last day of summer
    console.log(summer+'     '+eSummer) ;
    DateUtils.dayRange(summer, eSummer, true).forEach(item=> {daysoff[daysoff.length] = item}); // add all days of the summer to list
  }
  console.log(items);


  items.forEach(item=> {
    if (item[1].length === 1) {
      daysoff[daysoff.length] = DateUtils.monthToNum(item[1][0].match(/(\D){3}(?= )/g)[0])+'/'+parseInt(item[1][0].match(/[0-9]{2}(?=, )/g))+'/'+item[1][0].match(/[0-9]{4}/g)[0];
    } else {
      DateUtils.dayRange(item[1][0], item[1][1], false).forEach(item=> {daysoff[daysoff.length] = item})
    }


  });
  console.log(daysoff);

  if (returnListOfReasons) {
    console.warn('oop, need to do this...');
    return 'oop, need to do this...'
  }
  return daysoff
}


