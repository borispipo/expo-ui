const {exec,thowError,copy,writeFile,createDirSync} = require("./utils");
const fs = require("fs"), path = require("path");
const createAppDir = path.resolve(__dirname,"create-app");
module.exports = function(parsedArgs,{projectRoot}){
    const argvName = process.argv[3];
    const packageObj = require("../package.json");
    let root = process.cwd(), mainPackagePath = path.resolve(root,"package.json");
    let mainPackage = fs.existsSync(mainPackagePath) && require(`${mainPackagePath}`) || null;
    const name = argvName && argvName.trim() || String(mainPackage?.name).trim();
    if(!name){
        return thowError(name," nom de l'application invalide, veuillez spécifier un nom d'application valide",argv);
    }
    let hasPackage = String(mainPackage?.name)?.toLowerCase() !== name?.toLowerCase() ? false : mainPackage && typeof mainPackage =='object';
    if(!hasPackage){
      mainPackage = {
        name,
        version : "1.0.0",
        "description": "",
        "main": "index.js",
        scripts : {
          start : "npx expo start -c",
        }
     }
      const newDir = createDirSync(path.resolve(root,name.trim())); 
      projectRoot = newDir || projectRoot;
      mainPackagePath = path.resolve(projectRoot,"package.json");
    }
    const cb = ()=>{
      const devDpendencies = packageObj.devDependencies;
        const deps = devDpendencies && typeof devDpendencies =="object" && Object.keys(devDpendencies).join(" ") || "";
          new Promise((resolve,reject)=>{
          console.log("installing dev dependencies ....");
          return exec(`npm i -D @expo/webpack-config @expo/metro-config ${typeof deps=="string" && deps||""}`,{projectRoot}).then(resolve).catch(reject);
        }).then(()=>{}).finally(()=>{
            console.log("creating application .....");
            createEntryFile(projectRoot);
            [path.join(projectRoot,"babel.config.js"),path.join(projectRoot,"metro.config.js"),path.join(projectRoot,"webpack.config.js")].map((p)=>{
                if(!fs.existsSync(p)){
                    const file = path.basename(p);
                    writeFile(p,fs.readFileSync(`${path.join(createAppDir,file)}`));
                }
            });
            createAPPJSONFile(projectRoot,{...mainPackage,name});
            copy(path.resolve(createAppDir,"src"),path.resolve(projectRoot,"src"),{recursive:true,overwrite:false});
            process.exit();
        });
    }
    if(!hasPackage){
       writeFile(mainPackagePath,JSON.stringify(mainPackage,null,2));
       console.log("initializing application "+name+"...");
       exec("npm i @fto-consult/expo-ui",{projectRoot}).finally(cb);
    }  else {
        return cb();
    }
}

const createEntryFile = (projectRoot)=>{
    const mainEntry = path.join(projectRoot,"index.js");
    if(!fs.existsSync(mainEntry)){
        console.log("creating main entry ... on path",path.join(createAppDir,"registerApp.js"));
        writeFile(mainEntry,fs.readFileSync(path.join(createAppDir,"registerApp.js")));
        return true;
    }
    return false;
}

const createAPPJSONFile = (projectRoot,{name,version})=>{
    version = version ||"1.0.0";
    copy(path.join(createAppDir,"assets"),path.resolve(projectRoot,"assets"),{overwrite:false});
    const appJSONPath = path.join(projectRoot,"app.json");
        if(!fs.existsSync(appJSONPath)){
            writeFile(appJSONPath,`
{
    "expo": {
      "name": "${name}",
      "slug": "${name.toLowerCase().replace(/\s\s+/g, '-')}",
      "version":"${version}",
      "orientation": "portrait",
      "icon": "./assets/icon.png",
      "splash": {
        "image": "./assets/splash.png",
        "resizeMode": "contain",
        "backgroundColor": "#ffffff"
      },
      "userInterfaceStyle": "automatic",
      "assetBundlePatterns": [
        "**/*"
      ],
      "ios": {
        "supportsTablet": true
      },
      "android": {
        "adaptiveIcon": {
          "foregroundImage": "./assets/adaptive-icon.png",
          "backgroundColor": "#ffffff"
        }
      },
      "web": {
        "favicon": "./assets/favicon.png"
      }
    }
  }
            `)
        } else {
            const appJSON = require(`${appJSONPath}`);
            appJSON.version = version;
            writeFile(appJSONPath,JSON.stringify(appJSON,null, 2));
        }
    return fs.existsSync(appJSONPath);
}