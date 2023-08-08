#!/usr/bin/env node
/**
  toujours ajouter l'instruction ci-dessus à la première ligne de chaque script npx
@see : https://blog.shahednasser.com/how-to-create-a-npx-tool/ */
'use strict';
process.on('unhandledRejection', err => {
  throw err;
});
const createAppScript = "create-app";
const supportedScript = {
  "init" : true, //initialize electron app
  "start" : true,//start electron
  "build" : true, //script pour faire un build,
  "package" : true, ///script pour le packagin de l'application
  [createAppScript] : true,//les script de création de l'application
}
const  {createDir,writeFile,electronDir,copy,exec,throwError} = require("./utils");
const path= require("path");
const fs = require("fs");
const dir = path.resolve(__dirname);
const projectRoot = path.resolve(process.cwd());
if(projectRoot == dir){
   throwError(`Invalid project root ${projectRoot}; project root must be different to ${dir}`);
}
const parsedArgs = require("../electron/utils/parseArgs")(null,supportedScript);
parsedArgs.script = typeof parsedArgs.script =='string' && parsedArgs.script && parsedArgs.script.toLowerCase().trim() || "";
if(!parsedArgs.script || !(parsedArgs.script in supportedScript)){
   throwError("Erreur : script invalide, vous devez spécifier script figurant parmi les script : ["+Object.keys(supportedScript).join(", ")+"]");
}
let cmd = null;
const script = parsedArgs.script;
/**** 
 *    1. installer electron globallement : npm i -g electron@latest
 *  cmde : [cmd] start electron config=[path-to-config-relative-to-project-dir] 
 *        splash=[path-to-splashcreen-relative-to-project-root] 
 *        output-dir|out = [path-to-output-dir-relative-to-root-project]
 *        url = [url-to-start-electron-to]
 * */
if(parsedArgs.electron){
  const pathsJSON = path.resolve(electronDir,"paths.json");
  if(!fs.existsSync(pathsJSON)){
    throwError("Le fichier des chemins d'accès à l'application est innexistant, rassurez vous de tester l'application en environnement web, via la cmde <npx expo start>, avant l'exécution du script electron.");
  }
  const paths = require(`${pathsJSON}`);
  if(typeof paths !=='object' || !paths || !paths.projectRoot){
      throwError("Fichiers des chemins d'application invalide!!! merci d'exécuter l'application en environnement web|android|ios puis réessayez");
  }
  /**** le project root d'où a été lancé le script electron doit être le même que celui de l'application principale */
  if(projectRoot !== paths.projectRoot){
     throwError(`main app project root ${paths.projectRoot} must be equals to ${projectRoot} in which you want to generate electron app`);
  }
  const electronProjectRoot = path.resolve(projectRoot,"electron");
  const isElectionInitialized = require("../electron/is-initialized")(electronProjectRoot);
  process.env.isElectron = true;
  process.env.isElectronScript = true;
  if(!isElectionInitialized || script =='init'){
      if(script !=='init'){
          console.log("initializing electron application before ....");
      }
      return require("./init")({
         projectRoot,
         electronDir,
         electronProjectRoot,
         paths,
      });
  }
  require("../electron/create-index-file")(electronProjectRoot);
  const out = parsedArgs.out || parsedArgs["output-dir"];
  const outDir = out && path.dirname(out) && path.resolve(projectRoot,path.dirname(out),"electron") || path.resolve(electronProjectRoot,"bin")
  if(!createDir(outDir)){
      throwError("Impossible de créer le répertoire <<"+outDir+">> du fichier binaire!!");
  }
  const logoPath = paths.logo || paths.$assets && path.resolve(paths.$assets,"logo.png") || paths.$images && path.resolve(paths.$images,"logo.png");
  if(!logoPath || !fs.existsSync(logoPath)){
     if(logoPath){
      console.warn("Logo de l'application innexistant!! Vous devez spécifier le logo de votre application, fichier ["+(logoPath)+"]")
    }
  }
  const buildOutDir = path.resolve(electronProjectRoot,"dist");
  const indexFile = path.resolve(buildOutDir,"index.html");
  const webBuildDir = path.resolve(projectRoot,"web-build");
  const packagePath = path.resolve(projectRoot,"package.json");
  const url = parsedArgs.url  && parsedArgs.url.trim() || "";
  const start = x=>{
     return new Promise((resolve,reject)=>{
      cmd = "electron "+electronProjectRoot+" url="+url;
        exec({
          cmd, 
          projectRoot : electronProjectRoot,
        }).finally(()=>{
          console.log("ant to exit");
        })
        typeof (resolve) =='function' && setTimeout(resolve,1000);
    })
  };
  if(url){
    return start().then(process.exit);
  }
  const promise = new Promise((resolve,reject)=>{
    const next = ()=>{
        if(fs.existsSync(webBuildDir)){
            return copy(webBuildDir,buildOutDir).catch(reject).then(resolve);
        } else {
          reject("dossier web-build exporté par electron innexistant!!");
        }
      }
      if(!url && (parsedArgs.compile || !fs.existsSync(path.resolve(webBuildDir,"index.html")))){
        console.log("exporting expo web app ...");
        cmd = "npx expo export:web";
        return exec({cmd,projectRoot}).then(next).catch(reject);
      }
      next();
  });
  return promise.then(()=>{
    if(!fs.existsSync(buildOutDir) || !fs.existsSync(indexFile)){
       throwError("répertoire d'export web invalide où innexistant ["+buildOutDir+"]");
    }
    switch(parsedArgs.script){
        case "start":
           return start();
          break;
        case "build":
          break;
        default :
          if(!fs.existsSync(packagePath)){
              throwError("package.json file does not exist in "+projectRoot+". please make jure that your have running package script in expo root application");
          }
          const packageObj = require(`${packagePath}`);
          const electronPackage = require(`${path.resolve(electronProjectRoot,'package.json')}`);
          electronPackage.name = packageObj.name;
          electronPackage.version = packageObj.version;
          //copying package json in build folder
          writeFile(path.resolve(electronProjectRoot,"package.json"),JSON.stringify(electronPackage,null,"\t"));
          const platform = parsedArgs.platform || process.platform;
          console.log("packaing app from ",electronProjectRoot);
          return require("./package")({
              src : electronProjectRoot,
              dist : path.resolve(outDir,platform),
              platform,
              arch : parsedArgs.arch || undefined,
              projectRoot : electronProjectRoot,
         });
         break;
    }
  }).catch((e)=>{
    console.log(e," is cathing ggg");
  }).finally(()=>{
    process.exit();
  });
} else {
  if(script ===createAppScript){
    return require("./create-app")(parsedArgs,{projectRoot});
  }
  process.exit();
}