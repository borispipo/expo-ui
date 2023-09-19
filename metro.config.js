const path = require("path");
const fs = require("fs");
const { getDefaultConfig } = require('expo/metro-config');
module.exports = function(opts){
  const packageJSonPath = path.resolve(projectRoot,"package.json");
  const mainAppPackage = path.resolve(projectRoot,"expo-ui.json");
  if(!fs.existsSync(mainAppPackage) && fs.existsSync(packageJSonPath)){
    try {
        const packageObj = require(`${packageJSonPath}`);
        if(packageObj && typeof packageObj =='object'){
          ["scripts","private","main","repository","keywords","bugs","dependencies","devDependencies"].map(v=>{
              delete packageObj[v];
          });
          fs.writeFileSync(mainAppPackage,JSON.stringify(packageObj,null,"\t"));
        }
    } catch{}
  }
  const isDev = 'development' === process.env.NODE_ENV;
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
  ///on génère les librairies open sources utilisées par l'application
  require("./find-licenses");
  return config;
}