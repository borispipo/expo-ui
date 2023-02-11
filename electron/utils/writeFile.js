const fs = require("fs");
module.exports = function writeFile(path, contents, cb) {
  if(require("./createDir")(path)){
    return fs.writeFileSync(path, contents, cb);
  }
  throw {message : 'impossible de créer le repertoire associé au fichier'+path};
}