const fs = require("fs");
const writeFile = require("../electron/utils/writeFile");
const path = require("path");
const packageJSON = require("../package.json");

module.exports = ({electronProjectRoot,force,logo,appName})=>{
    if(!electronProjectRoot || typeof electronProjectRoot !='string' || !fs.existsSync(electronProjectRoot)){
        return null;
    }
    const indexPath = path.resolve(electronProjectRoot,"index.js");
    if(!fs.existsSync(indexPath) || force === true){
        writeFile(indexPath,`require("${packageJSON.name}/electron");`);
}
    return indexPath;
}