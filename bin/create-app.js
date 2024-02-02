const {exec,thowError,copy,writeFile,createDirSync,FILE:{sanitizeFileName},JSONFileManager} = require("./utils");
const fs = require("fs"), path = require("path");
const getAppDir = x=>path.resolve(__dirname,"create-app");
const mainAppDependencies = require("./create-app/dependencies");
module.exports = function(appName,{projectRoot:root}){
    const packageObj = require("../package.json");
    root = root && fs.existsSync(root) && root || process.cwd();
    let mainPackage = fs.existsSync(path.resolve(root,"package.json")) && require(`${path.resolve(root,"package.json")}`) || null;
    const name = appName && appName.trim() || mainPackage?.name && typeof mainPackage?.name=="string" && mainPackage.name.trim() || "";
    if(!name){
        return thowError(name," nom de l'application invalide, veuillez spécifier un nom d'application valide",argvName,process.argv);
    }
    root = root && fs.existsSync(path.resolve(root))? path.resolve(root) : process.cwd();
    const devDependencies = packageObj.devDependencies;
    const inSameFolder = typeof mainPackage?.name =="string" && mainPackage?.name.trim().toLowerCase() === name?.toLowerCase().trim();
    const projectRoot = path.join(`${root}/${!inSameFolder && name || ""}`);
    createDirSync(projectRoot);
    const mainPackagePath = path.join(projectRoot,"package.json");
    mainPackage = fs.existsSync(mainPackagePath) && require(`${mainPackagePath}`) || null;
    let hasPackage = !!mainPackage;
    const devDeps = {
      ...defaultDevDependencies,
      ...(devDependencies && typeof devDependencies ==='object'? devDependencies : {}),
    };
    delete devDeps.expo
    const euModule = "@fto-consult/expo-ui";
    let hasUpdateDeps = false;
    console.log("creating application name "+name);
    if(!hasPackage){
        mainPackage = {
          name,
          version : "1.0.0",
          "description": "",
          "main": "index.js",
          "main": "App.js",
          "scripts" : {
            start : "npx expo start -c",
            "dev" : "npx expo start --no-dev --minify -c",
            "serve-web" : "npx serve web-build --single",
            "build-web" : "npx expo export:web",
            "build-android" : "npx eas build --platform android --profile preview",
            "build-ios" : "eas build --platform ios",
          },
          "dependencies" : {
            [euModule] : packageObj.version,
            ...mainAppDependencies,
          },
          devDependencies : devDeps
        }
     } else {
      mainPackage.devDependencies = typeof mainPackage.devDependencies =='object' && mainPackage.devDependencies || {};
      mainPackage.dependencies = typeof mainPackage.dependencies ==="object" && mainPackage.dependencies || {};
      mainPackage.main = mainPackage.main || "node_modules/expo/AppEntry.js";
      for(let i in devDeps){
        if(!(i in mainPackage.devDependencies)){
            hasUpdateDeps = true;
            mainPackage.devDependencies[i] = devDeps[i];
        }
      }
      if(!(euModule in mainPackage.dependencies)){
          hasUpdateDeps = true;
          mainPackage.dependencies[euModule] = packageObj?.version;
      }
    }
    if(hasUpdateDeps || !hasPackage || !fs.existsSync(mainPackagePath)){
        writeFile(mainPackagePath,JSON.stringify(mainPackage,null,2),{overwrite:true});
    }
    console.log("creating application .....");
    ["babel.config.js","metro.config.js","webpack.config.js"].map((p)=>{
        const rP = path.join(projectRoot,p);
        const pp = path.join(getAppDir(),p);
        if(!fs.existsSync(rP) && fs.existsSync(pp)){
          copy(pp,rP,{overwrite:false}).catch((e)=>{});
        }
    });
    createAPPJSONFile(projectRoot,{...mainPackage,name});
    createEntryFile(projectRoot);
    console.log(projectRoot," is project root");
    copy(path.resolve(getAppDir(),"src"),path.resolve(projectRoot,"src"),{recursive:true,overwrite:false});
    console.log("installing dependencies ...");
    return new Promise((resolve,reject)=>{
      return exec(`npm install`,{projectRoot}).then(resolve).catch(resolve);
    }).then(()=>{
      return exec('npx expo install --fix',{projectRoot})
    }).finally(()=>{
      setTimeout(()=>{
        console.log("application ready");
        process.exit();
      },1000);
    });
}
const defaultDevDependencies = {
 "@expo/webpack-config":"latest", 
 "@expo/metro-config" : "latest", 
}
const createEntryFile = (projectRoot)=>{
    const mainEntry = path.join(projectRoot,"App.js");
    if(!fs.existsSync(mainEntry)){
        writeFile(mainEntry,fs.readFileSync(path.join(getAppDir(),"App.js")));
        return true;
    }
    return false;
}

const createAPPJSONFile = (projectRoot,{name,version})=>{
    version = version ||"1.0.0";
    copy(path.join(getAppDir(),"assets"),path.resolve(projectRoot,"assets"),{overwrite:false}).catch((e)=>{});
    const gP = path.resolve(projectRoot,".gitignore") ;
    if(!fs.existsSync(gP)){
      try {
        writeFile(gP,gitignore);
      } catch{};
    }
    const imagePluginOptions = {
      "photosPermission": `Autoriser $(PRODUCT_NAME) à accéder à vos photos.`,
      "cameraPermission" : `Autoriser $(PRODUCT_NAME) à accéder à votre camera`
    }, cameraPluginsOptions = {
      "cameraPermission" : `Autoriser $(PRODUCT_NAME) à accéder à votre camera`
    }
    const plugins = [
      ["expo-image-picker",imagePluginOptions],
      ["expo-camera",cameraPluginsOptions],
    ];
    appSheme = name? sanitizeFileName(name).replace(/ /g, '') : null;
    const appJSONPath = path.join(projectRoot,"app.json");
        if(!fs.existsSync(appJSONPath)){
            writeFile(appJSONPath,`
{
    "expo": {
      "name": "${name}",
      ${appSheme ? `"scheme": "${appSheme}",`:""}
      "slug": "${name.toLowerCase().replace(/\s\s+/g, '-')}",
      "version":"${version}",
      "orientation": "portrait",
      "plugins":${JSON.stringify(plugins)},
      "icon": "./assets/icon.png",
      "jsEngine": "hermes",
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
        "blockedPermissions": [],
        "softwareKeyboardLayoutMode": "pan",
        "adaptiveIcon": {
          "foregroundImage": "./assets/adaptive-icon.png",
          "backgroundColor": "#ffffff"
        }
      },
      "web": {
        "favicon": "./assets/favicon.png",
        "bundler": "webpack"
      }
    }
  }
            `)
        } else {
            const appJSONManager = JSONFileManager(appJSONPath);
            if(appSheme && !appJSONManager.hasKey("expo.scheme")){
               appJSONManager.set({
                "expo": {
                  "scheme":appSheme 
                },
              });
            }
            appJSONManager.set({version})
            let appPlugins = appJSONManager.get("expo.plugins");
            if(!Array.isArray(appPlugins)){
              appPlugins = plugins;
            } else {
              let hasFoundCamera = false, hasFoundImagePicker = false;
              appPlugins.map(pl=>{
                if(Array.isArray(pl)){
                  if(typeof pl[0] ==="expo-image-picker"){
                    hasFoundImagePicker = true;
                  } else if(pl[0] === "expo-camera"){
                    hasFoundCamera = true;
                  } 
                }
              });
              if(!hasFoundImagePicker){
                appPlugins.push(plugins[0]);
              }
              if(!hasFoundCamera){
                appPlugins.push(plugins[1]);
              }
            }
            appJSONManager.set({
              expo : {plugins:appPlugins}
            });
            appJSONManager.save();
        }
    const eas = path.resolve(projectRoot,"eas.json");
    const cEas = path.resolve(__dirname,"create-app","eas.json");
    if(!fs.existsSync(eas) && fs.existsSync(cEas)){
      try {
        copy(cEas,eas,{overwrite:false})
      } catch{}
    }
    return fs.existsSync(appJSONPath);
}

const gitignore = require("./gitignore");