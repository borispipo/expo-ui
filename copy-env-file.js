const fs = require("fs");
const fsExtra = require("fs-extra");
const path = require("path");
const writeFile = require("./electron/utils/writeFile");
/*** create and copy environment path to this directory
 * 
 */
module.exports = (projectRoot,forceCreate)=>{
    const isDevEnv = 'development' === process.env.NODE_ENV;
    if(!isDevEnv && process.env.IGNORE_ENV) return null;
    projectRoot = projectRoot && typeof projectRoot =="string" && fs.existsSync(projectRoot) && projectRoot || process.cwd();
    const environmentPath = path.resolve(projectRoot,".env");
    const localEnv = path.resolve(__dirname,".env");
    if(environmentPath && fs.existsSync(environmentPath)){
        // File ".env" will be created or overwritten by default.
        try {
          fsExtra.copySync(environmentPath, localEnv,{overwrite:true});
        }
        catch (e){}
    } 
    if(!fs.existsSync(localEnv) && forceCreate !==false){
        try {
            writeFile(localEnv,"");
        } catch(e){}
    }
    return localEnv;
}