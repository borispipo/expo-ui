const fs = require("fs");
const path = require("path");
const {writeFile,copy} = require("./bin/utils");

module.exports = (projectRoot,forceCreate)=>{
    const env = typeof process.env.NODE_ENV =="string" && process.env.NODE_ENV.toLowerCase().trim() || "development";
    const isDevEnv = 'development' === env;
    if(!isDevEnv && process.env.IGNORE_ENV) return null;
    projectRoot = projectRoot && typeof projectRoot =="string" && fs.existsSync(projectRoot) && projectRoot || process.cwd();
    const pWithEnv = path.resolve(projectRoot,`.env.${env}`);
    const environmentPath = fs.existsSync(pWithEnv) ? pWithEnv : path.resolve(projectRoot,".env"); 
    const localEnv = path.resolve(__dirname,".env");
    if(environmentPath && fs.existsSync(environmentPath) && environmentPath !== localEnv){
        // File ".env" will be created or overwritten by default.
        try {
          copy(environmentPath, localEnv,{overwrite:true});
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