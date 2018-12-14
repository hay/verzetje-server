const glob = require('glob-promise');
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

function removeFile(path) {
    const exists = fs.existsSync(path);
    if (exists) {
        fs.unlinkSync(path);
    }
}

module.exports = async function(callback) {
    removeFile('./movies.txt');
    removeFile('./output.mp4');
    let files = await glob('./uploads/*');
    files = files.map(f => `file '${f}'`).join('\n');
    fs.writeFileSync('movies.txt', files);
    await exec('ffmpeg -safe 0 -f concat -i ./movies.txt -c copy output.mp4');
}