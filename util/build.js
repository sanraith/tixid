const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');

try {
    // Go to root folder
    process.chdir(path.join(__dirname, '..'));

    // Remove current build
    fs.rmdirSync('./dist/', { recursive: true });
    let child = null;
    
    // Build client
    child = childProcess.exec('npm run ngBuild');
    child.stdout.on('data', data => console.log(data));

    // Build server
    child = childProcess.exec('tsc -P tsconfig.server.json');
    child.stdout.on('data', data => console.log(data));

} catch (err) {
    console.log(err);
} finally {
    process.chdir(__dirname);
}
