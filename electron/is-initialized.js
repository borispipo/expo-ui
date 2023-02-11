const fs = require("fs");
const path = require("path");
/*** check if electron is initialized at project root */
module.exports = (projectRoot)=>{
    projectRoot = typeof projectRoot =='string' && projectRoot && fs.existsSync(projectRoot) && projectRoot || process.cwd();
    return fs.existsSync(path.resolve(projectRoot,"node_modules")) && fs.existsSync(path.resolve(projectRoot,"index.js")) 
        && fs.existsSync(path.resolve(projectRoot,"package.json")) 
        && fs.existsSync(path.resolve(projectRoot,"main")) 
        && fs.existsSync(path.resolve(projectRoot,"renderer"))
        
    && true || false;
}