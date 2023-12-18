
/**** permet de retourner le chemin des fichier, généré via les alias paths.json
    contenant la liste des fichiers de l'application
*/
const fs = require("fs");
const path = requrie("path");


export default function (projectRoot){
    projectRoot = projectRoot && fs.existsSync(projectRoot) && projectRoot || process.cwd();
    const mainPackage = require("../../package.json");
    return path.resolve(projectRoot,"node_modules",mainPackage.name,"paths.json");
}