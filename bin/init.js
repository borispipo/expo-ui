const path= require("path");
const fs = require("fs");
const exec = require("../electron/utils/exec");
const createDir = require("../electron/utils/createDir");
const writeFile = require("../electron/utils/writeFile");
const copy = require("../electron/utils/copy");
const electronDir = path.resolve(__dirname,"..","electron");
const createIndexFile = require("../electron/create-index-file");
const appSuffix = "-desk";
const mainPackage = require("../package.json");
const mainPackageName = mainPackage.name;

module.exports = ({projectRoot,electronProjectRoot})=>{
    return new Promise((resolve,reject)=>{
        //make shure electron project root exists
        if(!createDir(electronProjectRoot)){
            throw "Unable to create electron project root directory at "+electronProjectRoot;
        }
        const mPackageJSON = Object.assign({},require(`${path.resolve(projectRoot,'package.json')}`));
        const electronPackagePath = path.resolve(electronProjectRoot,"package.json");
        const electronPackageJSON = Object.assign({},fs.existsSync(electronPackagePath)? require(electronPackagePath) : {});
        const projectRootPackage = {...mPackageJSON,...electronPackageJSON};
        const dependencies = require("../electron/dependencies");
        const electronProjectRootPackage = path.resolve(electronProjectRoot,"package.json");
        projectRootPackage.main = `index.js`;
        projectRootPackage.dependencies = {...dependencies.main,...Object.assign(electronPackageJSON.dependencies)};
        projectRootPackage.dependencies[mainPackage.name] = mainPackage.version;
        projectRootPackage.devDependencies = {...dependencies.dev,...Object.assign({},electronPackageJSON.devDependencies)};
        projectRootPackage.scripts = {
            "build" : `npx ${mainPackageName} electron build`,
            "start" : `npx ${mainPackageName} electron start`,
            "run-dev" : `npx ${mainPackageName} electron start`,
            "compile2start" : `npx ${mainPackageName} electron start --build`,
            ...Object.assign({},electronPackageJSON.scripts)
        }
        projectRootPackage.name = projectRootPackage.name;
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
        const gP = path.resolve(electronProjectRoot,".gitignore") ;
        if(!fs.existsSync(gP)){
          try {
            writeFile(gP,require("./gitignore"));
          } catch{};
        }
        try {
        
        } catch(e){}
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