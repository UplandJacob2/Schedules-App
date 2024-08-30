const fs = require('fs');
const path = require('path');

const sourceDir = __dirname+'src';
const destinationDir = sourceDir;

fs.readdirSync(sourceDir).forEach(file => {
  if (file.endsWith('.js.html')) {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(destinationDir, `${file}.js`);

    let content = fs.readFileSync(sourcePath, 'utf8');
    content = content.replace(/<script>/g, '').replace(/<\/script>/g, '');

    fs.writeFileSync(destPath, content);
    console.log(`Processed ${file} to ${destPath}`);
  }
});
