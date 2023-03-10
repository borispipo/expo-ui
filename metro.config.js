const path = require("path");
const fs = require("fs");
module.exports = function(opts){
  const nodeModulePath = `${process.cwd()}/node_modules`;
  const mConfigPath = fs.existsSync(`${nodeModulePath}/@expo/metro-config`) && `${nodeModulePath}/@expo/metro-config` || "@expo/metro-config";
  const { getDefaultConfig } = require(`${mConfigPath}`);
  
  opts = opts && typeof opts =='object'? opts : {};
  let {assetExts,sourceExts} = opts;
  assetExts = Array.isArray(assetExts)? assetExts: [];
  sourceExts= Array.isArray(sourceExts)?sourceExts : [];
  const projectRoot = process.cwd();
  const localDir = path.resolve(__dirname);
  const config = getDefaultConfig(projectRoot);
  config.watchFolders = Array.isArray(config.watchFolders) && config.watchFolders || [];
  if(projectRoot !== localDir){
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
  return config;
}