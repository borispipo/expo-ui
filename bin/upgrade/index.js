const path = require("path");
const fs = require("fs");
const {JSONManager,compareNPMVersions,writeFile} = require("@fto-consult/node-utils");
const dependencies = require(path.resolve(__dirname,"../create-app/dependencies"));
const devDependencies = require(path.resolve(__dirname,"../create-app/dependencies"));
const depreciatedDependencies = require(path.resolve(__dirname,"../create-app/depreciatedDependencies"));
const expoVersion = dependencies?.expo;
const projectRoot = process.cwd();
const projectRootPackagePath = path.resolve(projectRoot,"package.json");
const packageObj = fs.existsSync(projectRootPackagePath) ? require(projectRootPackagePath) : null;

const getSDKVersion = (version)=>{
    const split = String(version).trim().replace("^","").replace("~","").replace(/\s/g, '').split(".")[0];
    return String(parseInt(split)) == split ? split : null;
}

if(typeof expoVersion !="string" || !expoVersion){
    console.log("Invalid expo version, cannot perform application upgrade");
} else {
    if(!packageObj || typeof packageObj !=="object"){
        console.log(`Invalid package json file at ${projectRoot}`);
    } else {
        const eVersion = packageObj?.dependencies?.expo;
        if(!eVersion){
            console.log(`Invalid expo sdk version for application located at ${projectRoot}`);
            return;
        }
        if(compareNPMVersions(expoVersion,eVersion) < 1){
            console.log(`App already to date, current version of expo sdk is ${eVersion}, expo sdk version on @fto-consult/expo-ui is ${expoVersion}`);
            return;
        }
        const version = getSDKVersion(expoVersion);
        if(!version){
            console.log(`Invalid expo version number parsed from ${expoVersion}`);
            return;
        }
        const versionPath = path.resolve(__dirname,`${version}.js`);
        const currentVersion = getSDKVersion(eVersion) || eVersion;
        if(!fs.existsSync(versionPath)){
            console.log(`No expo ui upgrade file available to upgrade expo sdk version from  ${currentVersion} to ${version}, version path : ${versionPath}`);
            return;
        }
        const upgradeTool = require(`${versionPath}`);
        if(typeof upgradeTool !== "function"){
            console.log(`No defined function available to upgrade expo sdk version from  ${currentVersion} to ${version}, version path : ${versionPath}`);
            return;
        }
        console.log(`***********************************  UPGRADE Expo sdk version from ${currentVersion} to ${version} ****************************************`);
        const packageManager =  JSONManager(projectRootPackagePath);
        (Array.isArray(depreciatedDependencies)? depreciatedDependencies : []).map(dep=>{
            if(typeof dep =="string" && dep){
                packageManager.remove(`dependencies.${dep}`);
                packageManager.remove(`devDependencies.${dep}`);
            }
        });
        packageManager.persist();
        return Promise.resolve(upgradeTool({version,dependencies,packageObj,packageManager,currentVersion,depreciatedDependencies,devDependencies,projectRoot})).catch((e)=>{
            console.log(e,`An error occurs during expo skd version upgrage from ${currentVersion} to ${version}`);
            writeFile(projectRootPackagePath,JSON.stringify(packageObj,null,2));
        }).then(()=>{
            console.log(`expo sdk version ${currentVersion} updated successfull to ${version}`);
        });
    }
}
