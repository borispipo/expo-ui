const getDirName = require('path').dirname;
const fs = require("fs");
module.exports = function createDir(path) {
    if(!path || typeof path !='string') return false;
    const p = getDirName(path);
    if(!fs.existsSync(p)){
       try {
          fs.mkdirSync(p,{ recursive: true});
       } catch(e){
         console.log(e," making write file directory")
       }
    }
    return fs.existsSync(p);
}