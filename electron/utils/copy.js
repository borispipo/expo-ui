const fse = require('fs-extra');
const createDir = require("./createDir");
const path = require("path");
/*** copy file or folder using fs-extra : @see : https://github.com/jprichardson/node-fs-extra/blob/HEAD/docs/copy-sync.md */
module.exports = (srcPath,destPath,options)=>{
  options = typeof options =='object' && options ? options : {};
  options.overwrite = typeof options.overwrite =='boolean'? options.overwrite : true;
  return new Promise((resolve,reject)=>{
    try {
      if(!destPath || !createDir(path.resolve(path.dirname(destPath)))){
          throw "Chemin destination invalide!!\n impossible de créer le repertoire destination pour la copie du dossier|fichier(s)";
      }
      fse.copySync(srcPath, destPath, options);
      resolve(destPath);
    } catch (err) {
      console.error(err)
      reject(err);
    }
  })
}