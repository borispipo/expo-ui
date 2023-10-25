const {exec,thowError,copy,writeFile,createDirSync,getDependencyVersion} = require("./utils");
const fs = require("fs"), path = require("path");
const createAppDir = path.resolve(__dirname,"create-app");
module.exports = function(parsedArgs,{projectRoot:root}){
    const argvName = process.argv[3];
    const packageObj = require("../package.json");
    root = root && fs.existsSync(root) && root || process.cwd();
    let mainPackage = fs.existsSync(path.resolve(root,"package.json")) && require(`${path.resolve(root,"package.json")}`) || null;
    const name = argvName && argvName.trim() || mainPackage?.name && typeof mainPackage?.name=="string" && mainPackage.name.trim() || "";
    if(!name){
        return thowError(name," nom de l'application invalide, veuillez spécifier un nom d'application valide",argvName,process.argv);
    }
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
    const reactNativeVersion = getDependencyVersion(packageObj,"react-native");
    const expoVersion = getDependencyVersion(packageObj,"expo");
    const euModule = "@fto-consult/expo-ui";
    let hasUpdateDeps = false;
    console.log("creating application name "+name);
    if(!hasPackage){
        mainPackage = {
          name,
          version : "1.0.0",
          "description": "",
          "main": "index.js",
          "main": "node_modules/expo/AppEntry.js",
          "scripts" : {
            start : "npx expo start -c",
            "dev" : "npx expo start --no-dev --minify -c",
            "serve-web" : "npx serve web-build --single",
            "build-web" : "npx expo export:web",
            "build-android" : "npx eas build --platform android",
            "build-ios" : "eas build --platform ios",
          },
          "dependencies" : {
            [euModule] : "latest",
            //"expo" : expoVersion,
            //"react-native" : reactNativeVersion,
          },
          devDependencies : devDeps
        }
     } else {
      mainPackage.devDependencies = typeof mainPackage.devDependencies =='object' && mainPackage.devDependencies || {};
      mainPackage.dependencies = typeof mainPackage.dependencies ==="object" && mainPackage.dependencies || {};
      mainPackage.dependencies["react-native"] = reactNativeVersion;
      mainPackage.dependencies["expo"] = expoVersion;
      mainPackage.main = mainPackage.main || "node_modules/expo/AppEntry.js";
      for(let i in devDeps){
        if(!(i in mainPackage.devDependencies)){
            hasUpdateDeps = true;
            mainPackage.devDependencies[i] = devDeps[i];
        }
      }
      if(!(euModule in mainPackage.dependencies)){
          hasUpdateDeps = true;
          mainPackage.dependencies[euModule] = "latest";
      }
    }
    if(hasUpdateDeps || !hasPackage || !fs.existsSync(mainPackagePath)){
        writeFile(mainPackagePath,JSON.stringify(mainPackage,null,2),{overwrite:true});
    }
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
    console.log("intalling dependencies ...");
    return exec(`npm install`,{projectRoot}).finally(()=>{
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
    const mainEntry = path.join(projectRoot,"index.js");
    if(!fs.existsSync(mainEntry)){
        writeFile(mainEntry,fs.readFileSync(path.join(createAppDir,"registerApp.js")));
        return true;
    }
    return false;
}

const createAPPJSONFile = (projectRoot,{name,version})=>{
    version = version ||"1.0.0";
    copy(path.join(createAppDir,"assets"),path.resolve(projectRoot,"assets"),{overwrite:false});
    copy(path.join(createAppDir,".gitignore"),path.resolve(projectRoot,".gitignore"),{overwrite:false});
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
            const appJSON = require(`${appJSONPath}`);
            appJSON.version = version;
            writeFile(appJSONPath,JSON.stringify(appJSON,null, 2));
        }
    return fs.existsSync(appJSONPath);
}