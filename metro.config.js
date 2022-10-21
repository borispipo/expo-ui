const { getDefaultConfig } = require('@expo/metro-config');
const path = require("path");
module.exports = (opts)=>{
  opts = opts && typeof opts =='object'? opts : {};
  let {dir,assetExts,sourceExts} = opts;
  assetExts = Array.isArray(assetExts)? assetExts: [];
  sourceExts= Array.isArray(sourceExts)?sourceExts : [];
  dir = dir || path.resolve(__dirname);
  const projectRoot = path.resolve(dir);
  const localDir = path.resolve(__dirname);
  const config = getDefaultConfig(projectRoot);
  config.watchFolders = [projectRoot];
  if(projectRoot !== localDir){
    config.watchFolders.push(localDir);
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
  return config;
}