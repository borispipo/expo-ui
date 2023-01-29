const path = require("path");
const getDirName = require('path').dirname;
module.exports = function writeFile(path, contents, cb) {
    const p = getDirName(path);
    if(!fs.existsSync(p)){
       try {
          fs.mkdirSync(p,{ recursive: true});
       } catch(e){
         console.log(e," making write file directory")
       }
    }
    if(fs.existsSync(p)){
      return fs.writeFileSync(path, contents, cb);
    }
    throw {message : 'impossible de créer le repertoire '+p};
  }