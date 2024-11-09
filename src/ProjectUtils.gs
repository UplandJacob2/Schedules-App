const githubToken = PropertiesService.getScriptProperties().getProperty('GithubToken') // token stored as a script property
const scriptId = ScriptApp.getScriptId()
const scriptToken = ScriptApp.getOAuthToken()
const email = DriveApp.getFileById(ScriptApp.getScriptId()).getOwner().getEmail()
const githubRepoOwner = 'UplandJacob2'
const githubRepo = 'Schedules-App'
const branch = 'main'
// commit settings
const commitMessage = 'fix parse error'
// release settings
const version = '2.0.2pre-b'
const body = 'updates'
const prerelease = true


function minify_(inp) {
  const input = inp||'console.log (    1)'
  const response = UrlFetchApp.fetch('https://www.toptal.com/developers/javascript-minifier/api/raw', { 'muteHttpExceptions': true, 'method': 'POST', 'payload': `input=${encodeURIComponent(input)}` })
  l(response.getContentText())
}

function parse_(inp) {
  const input = inp||'<html></html>'
  const response = UrlFetchApp.fetch('https://www.toptal.com/developers/html-minifier/api/raw', { 'muteHttpExceptions': true, 'method': 'POST', 'payload': `input=${encodeURIComponent(input)}`})
  l(response.getContentText())
}
// function testParse() {
//   const files = getScriptSourceCode(false)
//   _.each(files, function(f) {
//     if(/\.js/.test(f.path)) parse_(f.content)
//   })
// }

// release packaging and stuff
function getAndPutFiles_(folder, url) {
  const options = { muteHttpExceptions: true, headers: { 'Authorization': `token ${githubToken}`, 'Accept': 'application/vnd.github.v3.raw' } };
  const files = JSON.parse(UrlFetchApp.fetch(url, options).getContentText())

  files.forEach(function putFile(file) {
    l(file.name, ':', file.type)
    if(file.type === 'file') {
      let fileResponse = UrlFetchApp.fetch(file.download_url, options);
      folder.createFile(fileResponse.getBlob()).setName(file.name);
    } else if(file.type === 'dir') {
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
    while(files.hasNext()) {
      let file = files.next().getBlob();
      l(path+file.getName())
      //file.setName(path + file.getName());
      blobs.push(file);
    }
    let folders = rootFolder.getFolders();
    while(folders.hasNext()) {
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
  const url = `https://api.github.com/repos/${githubRepoOwner}/${githubRepo}/contents`;

  const releaseFolder = DriveApp.getFolderById('1CpOEw5b7aVM09-bMFjnzJjBDUactpbHG')
  const folder = releaseFolder.createFolder(`SchedulesApp-v${version}`)
  l('creating files...')
  getAndPutFiles_(folder, url)
  l('getting from Google Drive and creating a zip...')
  const file = releaseFolder.createFile(zipFilesInFolder_(folder, `SchedulesApp-v${version}`))
  l('zip created')
  return file
}
/////////


function getScriptSourceCode(encoded) {
  l('---------- getting code from script...')
  let toReturn = []
  const params = { headers: { Authorization: `Bearer ${scriptToken}` }, followRedirects: true, muteHttpExceptions: true};
  const url = `https://script.google.com/feeds/download/export?id=${scriptId}&format=json`;
  const response = UrlFetchApp.fetch(url, params);
  const json = JSON.parse(response);

  toReturn = _.map(json.files, function mapFiles(file) {
    let fullName
    switch(file.type) {
      case 'server_js':
        fullName = `${file.name}.gs`; break;
      case 'json':
        fullName = `${file.name}.json`; break;
      case 'html':
        fullName = `${file.name}.html`; break;
      // no default
    }
    return {
      path: `src/${fullName}`,
      content: (encoded) ? Utilities.base64Encode(file.source) : file.source
    };
  });

  // for(let file in json.files) {
  //   const name = json.files[file].name
  //   const type = json.files[file].type
  //   let fullName
  //   switch(type) {
  //     case 'server_js':
  //       fullName = `${name}.gs`; break;
  //     case 'json':
  //       fullName = `${name}.json`; break;
  //     case 'html':
  //       fullName = `${name}.html`; break;
  //     // no default
  //   }
  //   toReturn.push([ fullName, json.files[file].source ])
  // }
  // l(JSON.stringify(toReturn))
  l('---------- done getting code from GAS')
  return toReturn
}
function getChangedSourceCode() {
  let arr = []
  const code = getScriptSourceCode(false)
  l('---------- checking for changes...')
  arr = _.filter(code, function filterFiles(f) {
    const url = `https://api.github.com/repos/${githubRepoOwner}/${githubRepo}/contents/${f.path}`;
    l(url)
    let getResponse = JSON.parse(UrlFetchApp.fetch(url, { muteHttpExceptions: true, headers: {authorization: `token ${githubToken}`} }).getContentText())
    // l(getResponse)
    if(f.content === Utilities.newBlob(Utilities.base64Decode(getResponse.content.replace(/\n/g, ''))).getDataAsString()) { l('no changes'); return false }
    else { l('CHANGES'); return true }
  })
  // for (f in code) {
  //   const url = `https://api.github.com/repos/${githubRepoOwner}/${githubRepo}/contents/src/${code[f].path}`;
  //   let getResponse = JSON.parse(UrlFetchApp.fetch(url, { muteHttpExceptions: true, headers: {authorization: `token ${githubToken}`} }).getContentText())
  //   l(url)
  //   let content = Utilities.base64Encode(Utilities.newBlob(code[f].content).getBytes())
  //   if(content === getResponse.content.replace(/\n/g, '')) {
  //     l('no changes');
  //   } else arr.push(code[f])
  // }
  // l(arr)
  l('---------- done checking for changes files')
  return arr
}
/**
 * updates one file at a time
 *
 **/
function updateGithubRepo_(filePath, content) {
  const url = `https://api.github.com/githubRepos/${githubRepoOwner}/${githubRepo}/contents/src/${filePath}`;

  const getResponse = JSON.parse(UrlFetchApp.fetch(url, { muteHttpExceptions: true, headers: {authorization: `token ${githubToken}`} }).getContentText())
  const sha = getResponse.sha

  l(githubRepo, branch, filePath, githubRepoOwner, email, githubToken, sha, url, /*
  getResponse
  //*/
  )
  l(content)
  content = Utilities.base64Encode(Utilities.newBlob(content).getBytes())
  if(content === getResponse.content.replace(/\n/g, '')) { l('no changes'); return }
  //if(filePath !== 'Code.gs') {return}

  const data = {
    'path': `src/${filePath}`,
    'message': commitMessage,
    'committer': {
      'name': githubRepoOwner,
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
      authorization: `token ${githubToken}`,
    }
  };
  const res = UrlFetchApp.fetch(url, params);
  l(res.getContentText());
}

function createBlob_(content) {
  l('----- create blob')
  const url = `https://api.github.com/repos/${githubRepoOwner}/${githubRepo}/git/blobs`;
  const options = {
    method: 'post',
    muteHttpExceptions: true,
    headers: {
      'Authorization': `Bearer ${githubToken}`,
      'Accept': 'application/vnd.github+json'
    },
    payload: JSON.stringify({
      content: content,
      encoding: 'utf-8'
    })
  };
  const response = UrlFetchApp.fetch(url, options);
  l(response.getContentText())
  l('----- done creating blob')
  return JSON.parse(response.getContentText()).sha;
}
function createTree_(blobs, baseTreeSha) {
  l('---------- create tree')
  l(blobs)
  const url = `https://api.github.com/repos/${githubRepoOwner}/${githubRepo}/git/trees`;
  const options = {
    method: 'post',
    muteHttpExceptions: true,
    contentType: 'application/json',
    headers: { 'Authorization': `Bearer ${githubToken}` },
    payload: JSON.stringify({ base_tree: baseTreeSha, tree: blobs })
  };
  const response = UrlFetchApp.fetch(url, options);
  l(response.getContentText())
  l('---------- done creating tree')
  return JSON.parse(response.getContentText()).sha;
}
function createCommit_(treeSha, parentSha) {
  l('---------- create commit')
  const url = `https://api.github.com/repos/${githubRepoOwner}/${githubRepo}/git/commits`;
  const options = {
    muteHttpExceptions: true,
    method: 'post',
    headers: { 'Authorization': `token ${githubToken}`, 'Content-Type': 'application/json' },
    payload: JSON.stringify({ message: commitMessage, tree: treeSha, parents: [parentSha] })
  };
  const response = UrlFetchApp.fetch(url, options);
  l(response.getContentText())
  l('---------- done creating commit')
  return JSON.parse(response.getContentText()).sha;
}
function getBaseTreeSha_(commitSha) {
  l('---------- getting base tree sha')
  const url = `https://api.github.com/repos/${githubRepoOwner}/${githubRepo}/git/commits/${commitSha}`;
  const options = {
    muteHttpExceptions: true,
    method: 'get',
    headers: {
      'Authorization': `Bearer ${githubToken}`
    }
  };
  const response = UrlFetchApp.fetch(url, options);
  const commit = JSON.parse(response.getContentText());
  l('---------- done getting base tree sha')
  return commit.tree.sha;
}
function getLatestCommitSha_() {
  l('---------- get latest commit sha')
  const url =`https://api.github.com/repos/${githubRepoOwner}/${githubRepo}/commits/${branch}`;
  const options = { method: 'get', headers: { 'Authorization': `token ${githubToken}` }, muteHttpExceptions: true };
  const response = UrlFetchApp.fetch(url, options);
  // l(response.getContentText())
  l('---------- done getting latest commit sha')
  return JSON.parse(response.getContentText()).sha;
}
function updateReference_(commitSha) {
  l('---------- update reference')
  const url = `https://api.github.com/repos/${githubRepoOwner}/${githubRepo}/git/refs/heads/${branch}`;
  const options = {
    method: 'patch',
    muteHttpExceptions: true,
    contentType: 'application/json',
    headers: { 'Authorization': `Bearer ${githubToken}` },
    payload: JSON.stringify({ sha: commitSha })
  };
  UrlFetchApp.fetch(url, options);
  l('---------- done updating reference')
}

function commitAll() {
  const files = getChangedSourceCode();
  const blobs = _.map(files, function mapBlobs(file) {
    l(file.path)
    return {
      path: file.path,
      sha: createBlob_(file.content),
      mode: '100644',
      type: 'blob'
    };
  });
  const parentSha = getLatestCommitSha_();
  const baseTreeSha = getBaseTreeSha_(parentSha)
  const treeSha = createTree_(blobs, baseTreeSha);
  const commitSha = createCommit_(treeSha, parentSha);
  Logger.log(`Commit SHA: ${commitSha}`);
  updateReference_(commitSha)
}


function githubCommit() {
  const contents = getScriptSourceCode(scriptId)
  for(let dat in contents) {
    updateGithubRepo_(contents[dat].path, contents[dat].contents)
  }
}
function gitHubRelease() {
  //const fileTxt = getGithubFilesAndZip_().getBlob().getDataAsString()
  const fileTxt = DriveApp.getFolderById('1CpOEw5b7aVM09-bMFjnzJjBDUactpbHG').getFilesByName(`SchedulesApp-v${version}.zip`).next().getBlob().getDataAsString()
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
    muteHttpExceptions: true, headers: { authorization: `token ${githubToken}`, }
  };
  const createResponse = UrlFetchApp.fetch(`https://api.github.com/repos/${githubRepoOwner}/${githubRepo}/releases`, params)
  l(createResponse.getContentText())

  const getResponse = UrlFetchApp.fetch(`https://api.github.com/repos/${githubRepoOwner}/${githubRepo}/releases/tags/v${version}`, { method: 'POST',
    muteHttpExceptions: true, headers: { authorization: `token ${githubToken}`, } } )
  l(getResponse.getContentText())

  let releaseId
  const githubApiUrl = `https://api.github.com/repos/${githubRepoOwner}/${githubRepo}/releases/${releaseId}/assets`
  const options = { method: 'POST', muteHttpExceptions: true,
    headers: { 'Authorization': `token ${githubToken}`, 'Content-Type': 'application/zip' },
    payload: fileTxt
  };
  const response = UrlFetchApp.fetch(githubApiUrl, options);
  l('Response:', response.getContentText());
}

function minifyAll() {
  const contents = getScriptSourceCode(scriptId)
  for(let dat in contents) {
    let n = contents[dat].path
    if( !(n === 'Date.js.html' || n === 'Datejs.js.html' || n === 'underscore-observe.js.html') && contents[dat][0].match(/(\.gs)|(\.js\.html)/g) ) {
      let data = contents[dat].contents.replace(/<\/?script>/g, '')//.replace(/(?<![;{},\n:]|(\/\/.+))\n(?! +\{)/g, ';\n')
      // l(data)
      minify_(data)
    }
  }
}