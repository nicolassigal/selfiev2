const FtpDeploy = require('ftp-deploy');
const chalk = require('chalk');
const ftpDeploy = new FtpDeploy();
const env = process.env.NODE_ENV === 'production' ? 'prod':'beta';
let progress = "";
let percentChar = "#";
for (var i = 0; i < 100; i++) { progress = progress + "-"; };

const credentials = {
    beta: {
        user: "nsigal@beta.tucourier.com.ar",
        password: "",
        host: "ftp.tucourier.com.ar",
        port: 21,
        localRoot: __dirname + '/dist/selfiev2',
        remoteRoot: '/beta/selfie-v2'
    },
    prod: {
        user: "prod@tucourier.com.ar",
        password: "",
        host: "ftp.tucourier.com.ar",
        port: 21,
        localRoot: __dirname + '/dist/selfiev2',
        remoteRoot: '/public_html/selfie-v2'
    }
}
const config = {
    ...credentials[env],
    include: ['*', '**/*'],      // this would upload everything except dot files
    //include: ['*.php', 'dist/*'],
    exclude: [
        "node_modules/**",
        "node_modules/**/.*",
        "dist/selfiev2/server/",
        "dist/selfiev2/server/**",
        "dist/selfiev2/server/**/.*",
        "dist/selfiev2/xlsx/",
        "dist/selfiev2/xlsx/**",
        "dist/selfiev2/xlsx/**/.*",
    ],
    deleteRemote: true,              // delete ALL existing files at destination before uploading, if true
    forcePasv: true                 // Passive mode is forced (EPSV command is not sent)
}
 
console.log('\nStart deployment on ' + env);
ftpDeploy.deploy(config)
    .then(res => console.log('\nfinished'))
    .catch(err => console.log(err))

ftpDeploy.on("uploading", function(data) {
    const total = data.totalFilesCount; // total file count being transferred
    const transfered = data.transferredFileCount+1; // number of files transferred
    const filename = data.filename; // partial path with filename being uploaded
    const transfer = chalk.yellow.bold(`[transferred: ${transfered}/${total}]`);
    const file = chalk.green.bold(`[file: ${filename}]`);
    const percent = Math.ceil((Number(transfered)/Number(total))*100);
    const percentText = chalk.green.bold(`${percent}%`);
    const progressArr = progress.split("");
    for (var i = 0; i < percent; i++) { progressArr[i] = "#"; }
    progress = progressArr.join("");
    process.stdout.write(`\u001b[2K\u001b[0E[${progress}][${percentText}][ ${total} files ]`);
});