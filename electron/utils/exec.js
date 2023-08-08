const {exec,execSync} = require('child_process');
const fs = require("fs");
const _exec = (cmd,cmdOpts,logMessages,sync)=>{
    cmdOpts = typeof cmdOpts =='object' && cmdOpts || {};
    cmdOpts.env = typeof cmdOpts.env =="object" && cmdOpts.env || {};
    cmdOpts.env = {...process.env,...cmdOpts.env};
    cmdOpts.env.platform = cmdOpts.env.platform || "electron";
   if(sync) {
    cmdOpts.stdio = cmdOpts.stdio || "inherit";
   }
    const timer = cmdOpts.loader !==false  && !sync ? loaderTimer(cmd) : null;
    if(sync){
        try {
            return execSync(cmd,cmdOpts);
        } catch(e){
            clearInterval(timer);
            throw e;
        }
        return null;
    }
    return new Promise((resolve,reject)=>{
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
      process.stdout.write("\r "+text+" "+P[x++]);
      x &= 3;
    }, timout);
  };
  
const runExec = function(cmdOpts,options,sync){
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
        return _exec(`cd ${projectRoot}`).then((r)=>{
            try {
                process.chdir(projectRoot);
            } catch(e){}
            return _exec(cmd,cmdOpts,logMessages);
        })
    }
    return _exec(cmd,cmdOpts,logMessages,sync);
}
module.exports = function(cmdOpts,options){
    return runExec(cmdOpts,options,false);
}

module.exports.execSync = module.exports.sync = function(cmdOpts,options){
    return runExec(cmdOpts,options,true);
}
