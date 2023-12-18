const fs = require("fs");
const writeFile = require("../electron/utils/writeFile");
const path = require("path");

module.exports = (electronProjectRoot)=>{
    if(!electronProjectRoot || typeof electronProjectRoot !='string' || !fs.existsSync(electronProjectRoot)){
        return null;
    }
    const indexPath = path.resolve(electronProjectRoot,"index.js");
    writeFile(indexPath,`module.exports = require("${packageJSON.name}/electron/index.js")`);
    return indexPath;
}