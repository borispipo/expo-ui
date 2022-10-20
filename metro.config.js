const { getDefaultConfig } = require('@expo/metro-config');
const path = require("path");
const isCaseSensitive = require("./is-os-case-sensitive");
const fs = require("fs");
module.exports = (opts)=>{
  opts = opts && typeof opts =='object'? opts : {};
  let {dir,nodeModulesPaths,assetExts,sourceExts} = opts;
  nodeModulesPaths = Array.isArray(nodeModulesPaths)? nodeModulesPaths : [];
  assetExts = Array.isArray(assetExts)? assetExts: [];
  sourceExts= Array.isArray(sourceExts)?sourceExts : [];
  dir = dir || path.resolve(__dirname);
  require("./expo-ui-path")(path.basename(__filename));
  const projectRoot = path.resolve(dir);
  const localDir = path.resolve(__dirname);
  const config = getDefaultConfig(projectRoot);
  config.watchFolders = [projectRoot];
  if(projectRoot !== localDir){
    config.watchFolders.push(localDir);
  }
  const eUI = path.resolve(projectRoot,"expo-ui-build-path.js");
  //si le fichier n'existe pas alors on le crèèe
  if(!fs.existsSync(eUI)){
    try {
        const writeStream = fs.createWriteStream(eUI);
        writeStream.write("module.exports=\"@fto-consult/expo-ui/\";");
        writeStream.end();
        return path.resolve(p,suffix).replace(sep,(sep+sep));
    }catch{}
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