const fs = require("fs");
const path = require("path");
const writeFile = require("./electron/utils/writeFile");
/*** create and copy environment path to this directory
 * 
 */
module.exports = (projectRoot,forceCreate)=>{
    projectRoot = projectRoot && typeof projectRoot =="string" && fs.existsSync(projectRoot) && projectRoot || process.cwd();
    const environmentPath = path.resolve(projectRoot,".env");
    const localEnv = path.resolve(__dirname,".env");
    if(environmentPath && fs.existsSync(environmentPath)){
        // File ".env" will be created or overwritten by default.
        try {
          fs.copyFileSync(environmentPath, localEnv,fs.constants.COPYFILE_FICLONE_FORCE);
        }
        catch (e){}
    } 
    if(!fs.existsSync(localEnv) && forceCreate !==false){
        writeFile(localEnv,"");
    }
    return localEnv;
}