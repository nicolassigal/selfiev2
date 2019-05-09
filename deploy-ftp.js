const FtpDeploy = require('ftp-deploy');
const ftpDeploy = new FtpDeploy();
const env = process.env.NODE_ENV === 'production' ? 'prod':'beta';
const credentials = {
    beta: {
        user: "nsigal@beta.tucourier.com.ar",
        password: "owl(6Q[v+-bE",
        host: "ftp.tucourier.com.ar",
        port: 21,
        localRoot: __dirname + '/dist/selfiev2',
        remoteRoot: '/beta/selfie-v2'
    },
    prod: {
        user: "",
        password: "",
        host: "",
        port: null,
        localRoot: '',
        remoteRoot: ''
    }
}
const config = {
    ...credentials[env],
    include: ['*', '**/*'],      // this would upload everything except dot files
    //include: ['*.php', 'dist/*'],
    exclude: [
        "node_modules/**",
        "node_modules/**/.*",
        "dist/selfiev2/server",
        "dist/selfiev2/server/**",
        "dist/selfiev2/server/**/.*",
        "dist/selfiev2/xlsx",
        "dist/selfiev2/xlsx/**",
        "dist/selfiev2/xlsx/**/.*",
    ],
    deleteRemote: true,              // delete ALL existing files at destination before uploading, if true
    forcePasv: true                 // Passive mode is forced (EPSV command is not sent)
}
 
console.log('Start deployment on ' + env);
ftpDeploy.deploy(config)
    .then(res => console.log('finished'))
    .catch(err => console.log(err))

ftpDeploy.on("uploading", function(data) {
    const total = data.totalFilesCount; // total file count being transferred
    const transfered = data.transferredFileCount; // number of files transferred
    const filename = data.filename; // partial path with filename being uploaded
    process.stdout.write(`\u001b[2K\u001b[0E[transferred: ${transfered}/${total}] [file: ${filename}]`);
});