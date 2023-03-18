const path= require("path");
const fs = require("fs");
const dir = path.resolve(__dirname);
const exec = require("../electron/utils/exec");
const createDir = require("../electron/utils/createDir");
const writeFile = require("../electron/utils/writeFile");
const copy = require("../electron/utils/copy");
const electronDir = path.resolve(__dirname,"..","electron");
const createIndexFile = require("../electron/create-index-file");
const appSuffix = " Desktop";

module.exports = ({
    projectRoot,
    electronProjectRoot,
    paths,
 })=>{
    return new Promise((resolve,reject)=>{
        //make shure electron project root exists
        if(!createDir(electronProjectRoot)){
            throw "Unable to create electron project root directory at "+electronProjectRoot;
        }
        const projectRootPackage = require(`${path.resolve(projectRoot,'package.json')}`);
        const dependencies = require("../electron/dependencies");
        const electronProjectRootPackage = path.resolve(electronProjectRoot,"package.json");
        projectRootPackage.dependencies = dependencies.main;
        projectRootPackage.devDependencies = dependencies.dev;
        projectRootPackage.scripts = {
            "compile" : "npx expo-ui electron compile",
            "start" : "npx expo-ui electron start",
            "compile2start" : "npx expo-ui electron start compile",
            "package" : "npx expo-ui electron package",
            "compile2package" : "npx expo-ui electron package compile"
        }
        projectRootPackage.name = projectRootPackage.name.trim().toUpperCase();
        projectRootPackage.realAppName = typeof projectRootPackage.realAppName =="string" && projectRootPackage.realAppName || projectRootPackage.name;
        if(!projectRootPackage.name.endsWith(appSuffix)){
            projectRootPackage.name +=appSuffix;
        }
        writeFile(electronProjectRootPackage,JSON.stringify(projectRootPackage,null,'\t'));
        if(!fs.existsSync(electronProjectRootPackage)){
            throw `unable to create ${electronProjectRootPackage} file`;
        }
        const mainFolder = path.resolve(electronProjectRoot,"main");
        const rendererFolder = path.resolve(electronProjectRoot,"renderer");
        if(!createDir(mainFolder)){
            throw `unable to create main process folder at ${mainFolder}`
        }
        if(!createDir(rendererFolder)){
            throw `unable to create renderer process folder at ${rendererFolder}`;
        }
        const mainFolderIndex = path.resolve(mainFolder,"index.js");
        const rendererFolderIndex = path.resolve(rendererFolder,"index.js");
        if(!fs.existsSync(mainFolderIndex)){
            copy(path.resolve(electronDir,"init","main.js"),mainFolderIndex);
        }
        if(!fs.existsSync(rendererFolderIndex)){
            copy(path.resolve(electronDir,"init","renderer.js"),rendererFolderIndex);
        }
        createIndexFile(electronProjectRoot);
        /**** copying all electron utils files */
        const utilsPath = path.resolve(electronProjectRoot,"utils");
        copy(path.resolve(electronDir,"utils"),utilsPath);
        console.log("installing package dependencies ...");
        return exec({
            cmd : "npm install",// --prefix "+electronProjectRoot,
            projectRoot : electronProjectRoot,
        }).then((a)=>{
            return resolve(a);
            console.log("initializing with electron-forge ....");
            return exec({
                cmd : `npx electron-forge import`,
            }).then(resolve);
        }).catch(reject);
    })
}

const copyExtra = (path2)=>{
    fs.readdirSync(path2).forEach((file) => {
        if(!file || file.toLowerCase() =="dist") return;
        file = path.join(path2,file);
        const stat = fs.statSync(file);
        if(stat.isDirectory()){
            return copyExtra(file);
        }
        if(!stat.isFile() || file === indexFile) return;
        extraResource.push(file);
    });
}