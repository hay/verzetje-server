const glob = require('glob-promise');
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = async function(callback) {
    fs.unlinkSync('./movies.txt');
    fs.unlinkSync('./output.mp4');
    let files = await glob('./uploads/*');
    files = files.map(f => `file '${f}'`).join('\n');
    fs.writeFileSync('movies.txt', files);
    await exec('ffmpeg -safe 0 -f concat -i ./movies.txt -c copy output.mp4');
}