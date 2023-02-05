///retourne le nom du repertoire d'un chemin passé en paramètre
const path = require("path");
function isFile(pathItem) {
    return !!path.extname(pathItem);
}
module.exports = (path_string)=>{
    if(!path_string || typeof path_string !=='string'){
        return null;
    }
    if(isFile(path_string)){
        return path.dirname(path_string);
    } 
    return path.resolve(path_string);
}