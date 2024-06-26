const fs = require("fs");
const path = require("path");

const checkEnv = (...envrs)=>{
    for(let i in envrs){
        const env = envrs[i];
        if(env && ["true","1",1].includes(process.env[env])){
            return true;
        }
    }
    return false;
}
module.exports = (projectRoot,forceCreate)=>{
    const env = typeof process.env.NODE_ENV =="string" && process.env.NODE_ENV.toLowerCase().trim() || "development";
    const isDevEnv = 'development' === env;
    if(!isDevEnv && checkEnv("IGNORE_ENV","NO_DOTENV")) return null;
    projectRoot = projectRoot && typeof projectRoot =="string" && fs.existsSync(projectRoot) && projectRoot || process.cwd();
    const pWithEnv = path.resolve(projectRoot,`.env.${env}`);
    const environmentPath = fs.existsSync(pWithEnv) ? pWithEnv : path.resolve(projectRoot,".env"); 
    if(environmentPath && fs.existsSync(environmentPath)){
        return environmentPath;
    } 
    return null;
}