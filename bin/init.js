const path= require("path");
const fs = require("fs");
const exec = require("../electron/utils/exec");
const createDir = require("../electron/utils/createDir");
const writeFile = require("../electron/utils/writeFile");
const copy = require("../electron/utils/copy");
const paths = require("../electron/utils/paths");
const electronDir = path.resolve(__dirname,"..","electron");
const createIndexFile = require("../electron/create-index-file");
const appSuffix = "-Desktop";
const mainPackage = require("../package.json");
const mainPackageName = mainPackage.name;

module.exports = ({projectRoot,electronProjectRoot,paths,pathsJSON})=>{
    return new Promise((resolve,reject)=>{
        //make shure electron project root exists
        if(!createDir(electronProjectRoot)){
            throw "Unable to create electron project root directory at "+electronProjectRoot;
        }
        const projectRootPackage = require(`${path.resolve(projectRoot,'package.json')}`);
        const dependencies = require("../electron/dependencies");
        const electronProjectRootPackage = path.resolve(electronProjectRoot,"package.json");
        projectRootPackage.main = "index.js";
        projectRootPackage.dependencies = dependencies.main;
        projectRootPackage.devDependencies = dependencies.dev;
        projectRootPackage.scripts = {
            "compile" : `npx ${mainPackageName} electron compile`,
            "start" : `npx ${mainPackageName} electron start`,
            "compile2start" : `npx ${mainPackageName} electron start compile`,
            "package" : `npx ${mainPackageName} electron package`,
            "compile2package" : `npx ${mainPackageName} electron package compile`
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
        const mainFolder = path.resolve(electronProjectRoot,'processes',"main");
        const rendererFolder = path.resolve(electronProjectRoot,'processes',"renderer");
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
        if(pathsJSON && fs.existsSync(pathsJSON)){
            try {
                copy(pathsJSON,path.resolve(electronProjectRoot,"paths.json"));
            } catch(e){}
        }
        console.log("installing package dependencies ...");
        return exec({
            cmd : "npm install",// --prefix "+electronProjectRoot,
            projectRoot : electronProjectRoot,
        }).then((a)=>{
            return resolve(a);
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