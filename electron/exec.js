const exec = require('child_process').exec;
const fs = require("fs");
const _exec = (cmd,cmdOpts,logMessages)=>{
    cmdOpts = typeof cmdOpts =='object' && cmdOpts || {};
    return new Promise((resolve,reject)=>{
        const timer = cmdOpts.loader !==false ? loaderTimer(cmd) : null;
        exec(cmd,cmdOpts, (error, stdout, stderr) => {
            if (error) {
                logMessages !== false && console.log(`error: ${error.message}`);;
                reject(error);
                clearInterval(timer);
                return;
            }
            if (stderr) {
                logMessages !== false && console.error(`stderr: ${stderr}`);
                reject(stderr);
                clearInterval(timer);
                return;
            }
            if(stdout && logMessages !== false){
                console.log(`stdout: ${stdout}`);
            }
            clearInterval(timer);
            resolve(stdout);
        });
    })
}
const loaderTimer = function(timout) {
    const text = typeof timout =='string' && timout ||'';
    timout = typeof timout =='number'? timout : 250;
    var P = ["\\", "|", "/", "-"];
    var x = 0;
    return setInterval(function() {
      process.stdout.write("\r"+" "+P[x++]);
      x &= 3;
    }, timout);
  };
module.exports = function(cmdOpts,options){
    if(typeof cmdOpts =='string'){
        cmdOpts = {cmd:cmdOpts};
    }
    options = typeof options =='object' && options ? options : {};
    cmdOpts = cmdOpts && typeof cmdOpts =="object"? cmdOpts : {};
    cmdOpts = {...cmdOpts,...options,cmd:cmdOpts.cmd|| cmdOpts.command};
    const {cmd,projectRoot,logMessages} = cmdOpts;
    if(!cmd|| typeof cmd !='string'){
        return Promise.reject("Commande de script invalide, veuillez spécifier une chaine de caractère non nulle");
    }
    if(typeof projectRoot =='string' && projectRoot && fs.existsSync(projectRoot)){
        return _exec('cd '+projectRoot).then((r)=>{
            return _exec(cmd,cmdOpts,logMessages);
        })
    }
    return _exec(cmd,cmdOpts,logMessages);
}