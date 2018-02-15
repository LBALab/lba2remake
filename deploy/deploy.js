const FtpDeploy = require('ftp-deploy');

const ftpDeploy = new FtpDeploy();
const args = process.argv.slice(2);
const config = {
    host: args[0],
    port: 21,
    username: args[1],
    password: args[2],
    localRoot: "www",
    remoteRoot: "",
    continueOnError: true,
    exclude: ['data/*'/*,'metadata/*'*/]
};

console.log("Start deploying...");

ftpDeploy.deploy(config, function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log('DONE!');
    }
});

ftpDeploy.on('uploading', function(data) {
    console.log(`Uploading ${data.filename}`);
})

ftpDeploy.on('upload-error', function (data) {
    console.log(data.err);
});
