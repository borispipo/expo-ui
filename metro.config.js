const { getDefaultConfig } = require('@expo/metro-config');
const path = require("path");
const isCaseSensitive = require("./is-os-case-sensitive");
module.exports = (opts)=>{
  require("./expo-ui-path");
  opts = opts && typeof opts =='object'? opts : {};
  let {dir,nodeModulesPaths,assetExts,sourceExts} = opts;
  nodeModulesPaths = Array.isArray(nodeModulesPaths)? nodeModulesPaths : [];
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
  const allNodePaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(localDir, 'node_modules'),
    ...nodeModulesPaths,
  ];
  const existingNodesPath= {},nPaths = [];
  allNodePaths.map(p=>{
    if(!p || typeof p !='string') return;
    if(isCaseSensitive){
      p = p.toLocaleLowerCase();
    }
    if(!existingNodesPath[p]){
      existingNodesPath[p] = true;
      nPaths.push(p);
    }
  });
  
  config.resolver.nodeModulesPaths = nPaths;
  // 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
  config.resolver.disableHierarchicalLookup = true;
  return config;
}