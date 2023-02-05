//#!/usr/bin/env node
/**@see : https://blog.shahednasser.com/how-to-create-a-npx-tool/ */
'use strict';
process.on('unhandledRejection', err => {
  throw err;
});
const supportedScript = {
  "start" : true,//start electron
  "build" : true, //script pour faire un build
}
const path= require("path");
const fs = require("fs");
const dir = path.resolve(__dirname);
const electronDir = path.resolve(dir, "..","electron");
const exec = require("../electron/exec");
let projectRoot = process.cwd();
const createDir = require("../electron/createDir");
const copyDir = require("../electron/copy");
const parsedArgs = require("../electron/parseArgs")(null,supportedScript);
if(!parsedArgs.script || !(parsedArgs.script in supportedScript)){
   console.error ("Erreur : script invalide, vous devez spécifier script figurant parmi les script : ["+Object.keys(supportedScript).join(", ")+"]");
   process.exit();
}
const {script} = parsedArgs;
let cmd = null;
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
    throw "Le fichier des chemins d'accès à l'application est innexistant, rassurez vous de tester l'application en environnement web, via la cmde <npx expo start>, avant l'exécution du script electron."
  }
  const paths = require(`${pathsJSON}`);
  if(typeof paths !=='object' || !paths || !paths.projectRoot){
      throw "Fichiers des chemins d'application invalide!!! merci d'exécuter l'application en environnement web|android|ios puis réessayez"
  }
  projectRoot = path.resolve(projectRoot);
  const out = parsedArgs.out || parsedArgs["output-dir"];
  const outDir = out && path.dirname(out) && path.resolve(projectRoot,path.dirname(out),"electron") || path.resolve(projectRoot,"dist","electron")
  if(!createDir(outDir)){
      throw "Impossible de créer le répertoire <<"+outDir+">> du fichier binaire!!";
  }
  const logoPath = paths.logo || paths.$assets && path.resolve(paths.$assets,"logo.png") || paths.$images && path.resolve(paths.$images,"logo.png");
  if(!logoPath || !fs.existsSync(logoPath)){
     if(logoPath){
      console.warn("Logo de l'application innexistant!! Vous devez spécifier le logo de votre application, fichier ["+(logoPath)+"]")
    }
  }
  const buildOutDir = path.resolve(electronDir,"dist");
  const indexFile = path.resolve(buildOutDir,"index.html");
  const webBuildDir = path.resolve(projectRoot,"web-build");
  const url = parsedArgs.url  && parsedArgs.url.trim() || "";
  const promise = new Promise((resolve,reject)=>{
      const next = ()=>{
        if(fs.existsSync(webBuildDir)){
            return copyDir(webBuildDir,buildOutDir).catch(reject).then(resolve);
        } else {
          reject("fichier web-build exporté par electron innexistant!!");
        }
      }
      if(!url && (parsedArgs.compile || !fs.existsSync(path.resolve(webBuildDir,"index.html")))){
        cmd = "npx expo export:web";
        console.log("******************** exporting app : "+cmd);
        return exec({cmd,projectRoot}).then(next).catch(reject);
      }
      next();
  });
  return promise.then(()=>{
    const start = ()=>{
      cmd = "electron "+electronDir+" url="+url;
      return new Promise((resolve,reject)=>{
          exec({
            cmd, 
            projectRoot : electronDir,
          }).finally(()=>{
            console.log("ant to exit");
          })
          setTimeout(resolve,1000)
      });
    }
    if(url){
       return start();
    }
    if(!fs.existsSync(buildOutDir) || !fs.existsSync(indexFile)){
       throw "répertoire d'export web invalide où innexistant ["+buildOutDir+"]"
    }
    switch(script){
        case "start":
           return start();
          break;
        case "build":
          break;
    }
  }).catch((e)=>{
    console.log(e," is cathing ggg");
  }).finally(()=>{
    process.exit();
  });
} else {
  process.exit();
}
