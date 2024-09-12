const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../src');
const destinationDir = sourceDir;

fs.readdirSync(sourceDir).forEach(file => {
  if (file.endsWith('.js.html')) {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(destinationDir, `${file}.js`);

    let content = fs.readFileSync(sourcePath, 'utf8');
    content = content.replace(/<script>/g, '').replace(/<\/script>/g, '');
    content = content.replace(/(?<=\/\/ eslint-disable-next-line\n)(.)+(?=\n)/g, '// LINE REMOVED');

    fs.writeFileSync(destPath, content);
    console.log(`Processed ${file} to ${destPath}`);
  }
});
