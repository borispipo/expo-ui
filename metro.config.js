const path = require("path");
const fs = require("fs");
const {writeFile,isObj,getDependencyVersion} = require("./electron/utils");
const { getDefaultConfig } = require('expo/metro-config');
module.exports = function(opts){
  const isDev = 'development' === process.env.NODE_ENV;
  //const nodeModulePath = `${process.cwd()}/node_modules`;
  //const mConfigPath = fs.existsSync(`${nodeModulePath}/@expo/metro-config`) && `${nodeModulePath}/@expo/metro-config` || "@expo/metro-config";
  //const { getDefaultConfig } = require(`${mConfigPath}`);
  opts = opts && typeof opts =='object'? opts : {};
  let {assetExts,sourceExts} = opts;
  assetExts = Array.isArray(assetExts)? assetExts: [];
  sourceExts= Array.isArray(sourceExts)?sourceExts : [];
  const projectRoot = path.resolve(process.cwd());
  const localDir = path.resolve(__dirname);
  //@see : https://docs.expo.dev/versions/latest/config/metro/
  const config = getDefaultConfig(projectRoot,{
    // Enable CSS support.,
    isCSSEnabled: true,
  });
  config.watchFolders = Array.isArray(config.watchFolders) && config.watchFolders || [];
  const isLocalTest = require("./is-local-dev")();
  if(!isLocalTest){
    config.watchFolders.push(localDir);
  }
  config.projectRoot = projectRoot;
  const mainPackagePath = path.resolve(projectRoot,"package.json");
  const mainPackage = fs.existsSync() && require(`${mainPackagePath}`) || null;
  const packageJSonPath = path.resolve(projectRoot,"package.json");
  if(fs.existsSync(packageJSonPath)){
      try {
          const packageObj = require(`${packageJSonPath}`);
          if(packageObj && typeof packageObj =='object'){
            ["scripts","private","main","repository","keywords","bugs","dependencies","devDependencies"].map(v=>{
                delete packageObj[v];
            })
            fs.writeFileSync(path.resolve(__dirname,"mainPackageJSON.json"),JSON.stringify(packageObj,null,"\t"));
          }
      } catch{}
  }
  const expoVersion = null;
  if(isObj(mainPackage) && isObj(mainPackage.dependencies)){
    if(expoVersion && mainPackage.dependencies["expo"] !== expoVersion){
        console.log("fix expo  dependencies to ",expoVersion);
        mainPackage.dependencies["expo"] = expoVersion;
        writeFile(mainPackagePath,JSON.stringify(mainPackage,null,2),{overrite:true});
    }
  }
  config.resolver.assetExts = [
     ...config.resolver.assetExts,
     ...assetExts,
     "db",
     "txt"
  ];
  config.resolver.sourceExts = [
      ...config.resolver.sourceExts,
      ...sourceExts,"txt",
      'jsx', 'js','tsx',
  ]
  // Remove all console logs in production...
  config.transformer.minifierConfig.compress.drop_console = false;
  /*config.platforms = Array.isArray(config.platforms) && config.platforms || [];
  ['ios', 'android', 'windows', 'web',"electron"].map(p=>{
    if(!config.platforms.includes(p)){
       config.platforms.push(p);
    }
  });*/
  return config;
}