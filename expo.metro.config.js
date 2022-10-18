const { getDefaultConfig } = require('@expo/metro-config');
const path = require("path");
module.exports = (opts)=>{
  opts = opts && typeof opts =='object'? opts : {};
  let {dir,nodeModulesPaths,assetExts,sourceExts} = opts;
  nodeModulesPaths = Array.isArray(nodeModulesPaths)? nodeModulesPaths : [];
  assetExts = Array.isArray(assetExts)? assetExts: [];
  sourceExts= Array.isArray(sourceExts)?sourceExts : [];
  dir = dir || path.resolve(__dirname);
  const projectRoot = path.resolve(dir);
  const workspaceRoot = path.resolve(projectRoot, '../..');
  const config = getDefaultConfig(projectRoot);
  const localDir = path.resolve(__dirname);
  config.watchFolders = [projectRoot];
  if(dir !== localDir){
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
      ...sourceExts,
      'jsx', 'js','tsx',
  ]
  // 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
  config.resolver.disableHierarchicalLookup = true;
  return config;
}