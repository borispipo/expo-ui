
/**** permet de retourner le chemin des fichier, généré via les alias paths.json
    contenant la liste des fichiers de l'application
*/
const fs = require("fs");
const path = require("path");

module.exports =  (projectRoot)=>{
    projectRoot = projectRoot && fs.existsSync(projectRoot) && projectRoot || process.cwd();
    return path.resolve(projectRoot,"node_modules",`expo-ui.paths.alias.json`);
}