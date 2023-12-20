const { program } = require('commander');
const mainApp = require("./main-app");

program
  .option('-u, --url <url>', 'L\'adresse url à ouvrir au lancement de l\'application')
  .option('-r, --root <projectRoot>', 'le chemin du project root de l\'application')
  //.option('-p, --paths <paths>', 'le chemin vers le fichiers paths.json contenant la liste des alias de l\'application, exportés au moment de la compilation')
  .parse();

const programOptions = program.opts();
const {url:pUrl,root:mainProjectRoot} = programOptions;

const isAsar = (typeof require.main =="string" && require.main ||"").indexOf('app.asar') !== -1;
const path = require("path");
const fs = require("fs");
const isValidUrl = require("../utils/isValidUrl");

const projectRoot = mainProjectRoot && fs.existsSync(mainProjectRoot) ? mainProjectRoot : process.cwd();
const electronProjectRoot = projectRoot && fs.existsSync(path.resolve(projectRoot,"electron")) && path.resolve(projectRoot,"electron") || '';
const packageJSONPath = path.resolve(projectRoot,"package.json");
const packageJSON = fs.existsSync(packageJSONPath) ? require(`${packageJSONPath}`) : {};

const ObjectSize = (object)=>{
    if(!object || typeof object !=='object' || Array.isArray(object)) return false;
    for(let i in object){
        if(object?.hasOwnProperty(i)) return true;
    }
    return false;
}

function mainExportedApp (options){
    options = Object.assign({},options);
    options.isAsar = isAsar;
    options.url = isValidUrl(options.url)? options.url : isValidUrl(pUrl)? pUrl : undefined;
    if(!options.electronProjectRoot || typeof options.electronProjectRoot !=="string" || !fs.existsSync(options.electronProjectRoot) && electronProjectRoot){
        options.electronProjectRoot = electronProjectRoot;
    }
    if(!options.projectRoot || typeof options.projectRoot !=='string' || !fs.existsSync(options.projectRoot)){
        options.projectRoot = projectRoot;
    }
    options.packageJSON = ObjectSize(options.packageJSON) && options.packageJSON || packageJSON;
    if(!ObjectSize(options.packageJSON)){
        if(options.projectRoot && fs.existsSync(path.resolve(options.projectRoot,"package.json"))){
            options.packageJSON = require(path.resolve(options.projectRoot,"package.json"));
        } else if(options.electronProjectRoot && fs.existsSync(path.resolve(options.electronProjectRoot,"package.json"))){
            options.packageJSON = require(path.resolve(options.electronProjectRoot,"package.json"));
        }
    }
    return mainApp(options);
}
module.exports = mainExportedApp;

if(isValidUrl(pUrl) || electronProjectRoot){
    mainExportedApp({url:pUrl,electronProjectRoot,packageJSON});
}