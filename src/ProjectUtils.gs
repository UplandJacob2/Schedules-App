const token = PropertiesService.getScriptProperties().getProperty('GithubToken') // token stored as a script property
const email = DriveApp.getFileById(ScriptApp.getScriptId()).getOwner().getEmail()
const name = 'UplandJacob2'
const repo = 'Schedules-App'
const branch = 'main'
// commit settings
const message = 'fix ESLint alerts'
// release settings
const version = '2.0.2pre-b'
const body = 'updates'
const prerelease = true

function minify_(inp) {
  let input = inp||'console.log (    1)'
  let response = UrlFetchApp.fetch('https://www.toptal.com/developers/javascript-minifier/api/raw', { 'muteHttpExceptions': true, 'method': 'POST', 'payload': `input=${encodeURIComponent(input)}` })
  l(response.getContentText())
}


function parse_(inp) {
  let input = inp||'<html></html>'
  let response = UrlFetchApp.fetch('https://www.toptal.com/developers/html-minifier/api/raw', { 'muteHttpExceptions': true, 'method': 'POST', 'payload': `input=${encodeURIComponent(input)}`})
  l(response.getContentText())
}


function getAndPutFiles_(folder, url) {
  let options = { muteHttpExceptions: true, headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3.raw' } };
  let files = JSON.parse(UrlFetchApp.fetch(url, options).getContentText())

  files.forEach(function(file) {
    l(file.name, ':', file.type)
    if (file.type === 'file') {
      let fileResponse = UrlFetchApp.fetch(file.download_url, options);
      folder.createFile(fileResponse.getBlob()).setName(file.name);
    } else if (file.type === 'dir') {
      let nFolder = folder.createFolder(file.name)
      url = `${url}/${file.name}`
      getAndPutFiles_(nFolder, url)
    }
  });
}
function zipFilesInFolder_(folder, filename) {
  function getBlobs(rootFolder, path) {
    let blobs = [];
    let files = rootFolder.getFiles();
    while (files.hasNext()) {
      let file = files.next().getBlob();
      l(path+file.getName())
      //file.setName(path + file.getName());
      blobs.push(file);
    }
    let folders = rootFolder.getFolders();
    while (folders.hasNext()) {
      let subfolder = folders.next();
      let subPath = `${path+subfolder.getName()}/`;
      l(path+subPath)
      blobs.push(Utilities.newBlob([]).setName(subPath));
      blobs = blobs.concat(getBlobs(subfolder, subPath));
    }
    return blobs;
  }
  return Utilities.zip(getBlobs(folder, ''), `${filename}.zip`);
}
function getGithubFilesAndZip_() {
  let url = `https://api.github.com/repos/${name}/${repo}/contents`;

  let releaseFolder = DriveApp.getFolderById('1CpOEw5b7aVM09-bMFjnzJjBDUactpbHG')
  let folder = releaseFolder.createFolder(`SchedulesApp-v${version}`)
  l('creating files...')
  getAndPutFiles_(folder, url)
  l('getting from Google Drive and creating a zip...')
  let file = releaseFolder.createFile(zipFilesInFolder_(folder, `SchedulesApp-v${version}`))
  l('zip created')
  return file
}



function getScriptSourceCode_(fileid) {
  let toReturn = []
  let params = { headers: { Authorization: `Bearer ${ScriptApp.getOAuthToken()}` }, followRedirects: true, muteHttpExceptions: true};
  let url = `https://script.google.com/feeds/download/export?id=${fileid}&format=json`;
  let response = UrlFetchApp.fetch(url, params);
  let json = JSON.parse(response);

  for (let file in json['files']) {
    let name = json['files'][file]['name']
    let type = json['files'][file]['type']
    let fullName
    switch (type) {
      case 'server_js':
        fullName = `${name}.gs`; break
      case 'json':
        fullName = `${name}.json`; break
      case 'html':
        fullName = `${name}.html`; break
    }
    toReturn.push([ fullName, json['files'][file]['source'] ])
  }
  return toReturn
}
function updateGithubRepo_(filePath, content) {
  const url = `https://api.github.com/repos/${name}/${repo}/contents/src/${filePath}`;

  let getResponse = JSON.parse(UrlFetchApp.fetch(url, { muteHttpExceptions: true, headers: {authorization: `token ${token}`} }).getContentText())
  let sha = getResponse['sha']

  l(repo, branch, filePath, name, email, token, sha, url, /*
  getResponse
  //*/
  )

  content = Utilities.base64Encode(Utilities.newBlob(content).getBytes())
  if (content === getResponse['content'].replace(/\n/g, '')) { l('no changes'); return }
  //if (filePath !== 'Code.gs') {return}

  const data = {
    'path': `src/${filePath}`,
    'message': message,
    'committer': {
      'name': name,
      'email': email
    },
    'content': content,
    'branch': branch,
    'sha': sha
  };
  const params = {
    method: 'put',
    payload: JSON.stringify(data),
    muteHttpExceptions: true,
    headers: {
      authorization: `token ${token}`,
    }
  };
  const res = UrlFetchApp.fetch(url, params);
  l(res.getContentText());
}


function githubCommit() {
  let contents = getScriptSourceCode_(ScriptApp.getScriptId())
  for (let dat in contents) {
    updateGithubRepo_(contents[dat][0], contents[dat][1])
  }
}
function gitHubRelease() {
  //let fileTxt = getGithubFilesAndZip_().getBlob().getDataAsString()
  let fileTxt = DriveApp.getFolderById('1CpOEw5b7aVM09-bMFjnzJjBDUactpbHG').getFilesByName(`SchedulesApp-v${version}.zip`).next().getBlob().getDataAsString()
  const data = {
    tag_name: `v${version}`,
    target_commitish: branch,
    name: `SchedulesApp-v${version}`,
    body: body,
    draft: false,
    prerelease: prerelease,
    generate_release_notes: true
  };
  const params = { method: 'POST', payload: JSON.stringify(data),
    muteHttpExceptions: true, headers: { authorization: `token ${token}`, }
  };
  let createResponse = UrlFetchApp.fetch(`https://api.github.com/repos/${name}/${repo}/releases`, params)
  l(createResponse.getContentText())

  let getResponse = UrlFetchApp.fetch(`https://api.github.com/repos/${name}/${repo}/releases/tags${'v'+version}`, { method: 'POST',
    muteHttpExceptions: true, headers: { authorization: `token ${token}`, } } )
  l(getResponse.getContentText())

  let releaseId
  const githubApiUrl = `https://api.github.com/repos/${name}/${repo}/releases/${releaseId}/assets`
  const options = { method: 'POST', muteHttpExceptions: true,
    headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/zip' },
    payload: fileTxt
  };
  const response = UrlFetchApp.fetch(githubApiUrl, options);
  l('Response:', response.getContentText());
}

function minifyAll() {
  let contents = getScriptSourceCode_(DriveApp.getFilesByName('Schedules App').next().getId())
  for (let dat in contents) {
    let n = contents[dat][0]
    if ( !(n === 'Date.js.html' || n === 'Datejs.js.html' || n === 'underscore-observe.js.html') && contents[dat][0].match(/(\.gs)|(\.js\.html)/g) ) {
      let data = contents[dat][1].replace(/<\/?script>/g, '')//.replace(/(?<![;{},\n:]|(\/\/.+))\n(?! +\{)/g, ';\n')
      // l(data)
      minify_(data)
    }
  }
}