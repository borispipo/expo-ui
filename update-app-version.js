const editJsonFile = require("./edit-json-file.js");
const fs = require("fs");
/***** le fichier de configuration doit être stocké dans le repertoire /src/config.js où src est le repertoire source du projet parent qui a installé l'application */
const run = () => {
  const parentPackage = require("./parent-package")();
  if(!parentPackage) return;
  console.log("before updating parent package version ",parentPackage)
  const srcParent = path.dirname(parentPackage,"src","config.js");
  if(fs.existsSync(srcParent)){
    const appConfig = require(srcParent);
    if(appConfig && typeof appConfig =='object'){
      console.log("updating parent package version ",parentPackage)
      let config = {version:appConfig.version};
      editJsonFile(parentPackage,config);
    } 
  }
}

run();