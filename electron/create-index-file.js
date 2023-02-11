const fs = require("fs");
const writeFile = require("../electron/utils/writeFile");
const path = require("path");

module.exports = (electronProjectRoot)=>{
    if(!electronProjectRoot || typeof electronProjectRoot !='string' || !fs.existsSync(electronProjectRoot)){
        return null;
    }
    const indexPath = path.resolve(electronProjectRoot,"index.js");
    const electronDir = path.resolve(__dirname,"..","electron");
    writeFile(indexPath,`module.exports = require("${path.resolve(electronDir,'index.js').split(path.sep).join("/")}");`);
    return indexPath;
}