const fse = require('fs-extra');
const createDir = require("./createDir");
module.exports = (srcDir,destDir,options)=>{
  options = typeof options =='object' && options ? options : {};
  options.overwrite = typeof options.overwrite =='boolean'? options.overwrite : true;
  return new Promise((resolve,reject)=>{
    try {
      if(!createDir(destDir)){
          throw "Chemin destination invalide!!\n impossible de créer le repertoire destination pour la copie du dossier|fichier(s)";
      }
      fse.copySync(srcDir, destDir, options);
      resolve(destDir);
    } catch (err) {
      console.error(err)
      reject(err);
    }
  })
}