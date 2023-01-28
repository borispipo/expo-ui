const { getDefaultConfig } = require('@expo/metro-config');
const path = require("path");
module.exports = function(opts){
  opts = opts && typeof opts =='object'? opts : {};
  let {assetExts,sourceExts} = opts;
  assetExts = Array.isArray(assetExts)? assetExts: [];
  sourceExts= Array.isArray(sourceExts)?sourceExts : [];
  const projectRoot = process.cwd();
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
  // Remove all console logs in production...
  config.transformer.minifierConfig.compress.drop_console = true;
  return config;
}