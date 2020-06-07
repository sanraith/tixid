const path = require('path');
const fs = require('fs-extra');
const childProcess = require('child_process');

try {
    // Go to root folder
    process.chdir(path.join(__dirname, '..'));

    // Remove current build
    fs.removeSync('./dist/');

    // Transpile client side typescript files
    childProcess.exec('tsc -P src/client/tsconfig.json');

    // Copy front-end files
    fs.copySync('./src/server/public', './dist/public');
    fs.copySync('./src/server/views', './dist/views');

    // Transpile the typescript files
    childProcess.exec('ttsc -P src/server/tsconfig.json');
} catch (err) {
    console.log(err);
} finally {
    process.chdir(__dirname);
}
