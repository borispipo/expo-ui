#!/usr/bin/env node

/**
  toujours ajouter l'instruction ci-dessus à la première ligne de chaque script npx
  @see : https://blog.shahednasser.com/how-to-create-a-npx-tool/ 
  @see : https://www.npmjs.com/package/commander, for command parsing
*/
'use strict';

const { program } = require('commander');
const path= require("path");
const fs = require("fs");
const  {createDir,electronDir,copy,exec,throwError,paths:getPaths,writeFile} = require("./utils");


const dir = path.resolve(__dirname);
const projectRoot = path.resolve(process.cwd());
const packageObj = require("../package.json");
const version = packageObj.version;
const description = packageObj.description;
const packageName = packageObj.name;


program
  .name(packageName)
  .description(`Utilitaire cli lié au framework ${packageName}`)
  .version(version);
  
  
program.command('create-app')
  .description(`crèe et initialise une application ${packageName}`)
  .argument('<appName>', 'le nom de l\'application à initialiser')
  .option('-r, --project-root [dir]', 'le project root de l\'application')
  .action((appName, options) => {
    require("./create-app")(appName,Object.assign({},options))
  });

program.command('generate-getTable')
  .description('permet de générer le fichier getTable.js contenant la fonction permettant de récupérer une tableData')
  .action((src, options) => {
    require("./generate-tables")();
  });
  
program.command('electron')
  .description('utilitaire cli pour la plateforme electron. NB : Le package electron doit être installé globalement via l\'instruction npm i -g electron')
  .argument('<cmd>', 'la commande à exécuter (start,init,build)')
  //.option('-r, --project-root [dir]', 'le project root de l\'application')
  .option('-c, --config [dir]', 'le chemin (relatif au project root) du fichier de configuration de l\'application electron')
  //.option('-s, --splash [dir]', 'le chemin (relatif au project root) du fichier du splash screen de l\'application')
  .option('-o, --out [dir]', 'le chemin (relatif au project root) du répertoire qui contiendra les fichiers build')
  .option('-u, --url [url]', 'le lien url qui sera ouvert par l\'application')
  .option('-i, --compile [url]', 'le lien url qui sera ouvert par l\'application')
  .option('-a, --arch [architecture]', 'l\'architecture de la plateforme')
  .option('-p, --platform [platform]', 'la plateforme à utiliser pour la compilation')
  .action((script, options) => {
    const electronProjectRoot = path.resolve(projectRoot,"electron");
    const opts = Object.assign({},typeof options.opts =='function'? options.opts() : options);
    let {out,arch,url,compile,platform} = opts;
    //let {projectRoot} = opts;
    if(projectRoot == dir){
        throwError(`Invalid project root ${projectRoot}; project root must be different to ${dir}`);
    }
    let pathsJSON = path.resolve(getPaths(projectRoot));
    const electronPathsJSON = path.resolve(electronProjectRoot,"paths.json");
    if(!fs.existsSync(pathsJSON)){
      if(fs.existsSync(electronPathsJSON)){
        pathsJSON = electronPathsJSON
      } else {
        throwError("Le fichier des chemins d'accès à l'application est innexistant, rassurez vous de tester l'application en environnement web, via la cmde <npx expo start>, avant l'exécution du script electron.");
      }
    } 
    const paths = require(`${pathsJSON}`);
    if(typeof paths !=='object' || !paths || !paths.projectRoot){
        throwError("Fichiers des chemins d'application invalide!!! merci d'exécuter l'application en environnement web|android|ios puis réessayez");
    }
    /**** le project root d'où a été lancé le script electron doit être le même que celui de l'application principale */
    if(projectRoot !== paths.projectRoot){
       throwError(`main app project root ${paths.projectRoot} must be equals to ${projectRoot} in which you want to generate electron app`);
    }
    
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
           pathsJSON
        });
    }
    require("../electron/create-index-file")(electronProjectRoot);
    const outDir = out && path.dirname(out) && path.resolve(path.dirname(out),"electron") || path.resolve(electronProjectRoot,"bin")
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
    if(!fs.existsSync(packagePath)){
        throwError("package.json file does not exist in "+projectRoot+". please make jure that your have running package script in expo root application");
    }
    const packageObj = require(`${packagePath}`);
    const homepage = packageObj.homepage;
    let cmd = undefined;
    const start = x=>{
       return new Promise((resolve,reject)=>{
        cmd = `electron "${electronProjectRoot}"${url? ` --url ${url}`:''} --paths ${pathsJSON} --root ${projectRoot}`;
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
        if(!url && (compile || script ==="build" || !fs.existsSync(path.resolve(webBuildDir,"index.html")))){
          console.log("exporting expo web app ...");
          try {
            writeFile(packagePath,JSON.stringify({...packageObj,homepage:"./"},null,"\t"));
          } catch{}
          cmd = "npx expo export:web";
          return exec({cmd,projectRoot}).then((e)=>{
            try {
              writeFile(packagePath,JSON.stringify({...packageObj,homepage},null,"\t"));
            } catch{}
             next(e);
          }).catch(reject);
        }
        next();
    });
    return promise.then(()=>{
      if(!fs.existsSync(buildOutDir) || !fs.existsSync(indexFile)){
         throwError("répertoire d'export web invalide où innexistant ["+buildOutDir+"]");
      }
      switch(script){
          case "start":
             return start();
            break;
          case "build":
            break;
          default :
            const electronPackage = require(`${path.resolve(electronProjectRoot,'package.json')}`);
            electronPackage.name = packageObj.name;
            electronPackage.version = packageObj.version;
            //copying package json in build folder
            writeFile(path.resolve(electronProjectRoot,"package.json"),JSON.stringify(electronPackage,null,"\t"));
            platform = platform || process.platform;
            console.log("packaing app from ",electronProjectRoot);
            return require("./package")({
                src : electronProjectRoot,
                dist : path.resolve(outDir,platform),
                platform,
                arch : arch || undefined,
                projectRoot : electronProjectRoot,
           });
           break;
      }
    }).catch((e)=>{
      console.log(e," is cathing ggg");
    }).finally(()=>{
      process.exit();
    });

  });

  program.parse();