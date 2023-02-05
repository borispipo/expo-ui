const fs = require("fs");
module.exports = function createDir(path,cb) {
    if(!path || typeof path !='string') return false;
    const p = require("./getDirname")(path);
    if(!p) return false;
    if(!fs.existsSync(p)){
       try {
          fs.mkdirSync(p,{ recursive: true});
       } catch(e){
          if (e.code === 'EEXIST') { // p already exists!
            return p;
          }
          // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
          if (e.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
            throw new Error(`EACCES: permission denied, mkdir '${path.resolve(p,"..")}'`);
          } else {
            console.log(e," making write file directory")
          }
          /*const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(e.code) > -1;
          if (!caughtErr || caughtErr && curDir === path.resolve(targetDir)) {
            throw err; // Throw if it's just the last created dir.
          }*/
       }
    }
    const ex = fs.existsSync(p);
    if(ex && typeof cb =='function'){
      cb(p);
    }
    return ex ? p : false;
}