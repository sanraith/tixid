const path = require('path');
const fs = require('fs-extra');
const childProcess = require('child_process');

try {
    // Go to root folder
    process.chdir(path.join(__dirname, '..'));

    // Remove current build
    fs.removeSync('./dist/');

    // Copy front-end files
    fs.copySync('./src/public', './dist/public');
    fs.copySync('./src/views', './dist/views');

    // Transpile the typescript files
    childProcess.exec('npx ttsc');
} catch (err) {
    console.log(err);
} finally {
    process.chdir(__dirname);
}
