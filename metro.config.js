const path = require("path");
const fs = require("fs");
const { getDefaultConfig } = require('@expo/metro-config');
module.exports = function(opts){
  opts = opts && typeof opts =='object'? opts : {};
  const isDev = String(process.env.NODE_ENV).toLowerCase().trim() !="production";
  let {assetExts,sourceExts} = opts;
  assetExts = Array.isArray(assetExts)? assetExts: [];
  sourceExts= Array.isArray(sourceExts)?sourceExts : [];
  const projectRoot = typeof opts.projectRoot =="string" && opts.projectRoot && fs.existsSync(path.resolve(opts.projectRoot))? path.resolve(opts.projectRoot) : path.resolve(process.cwd());
  const transpilePath = null;//require("./create-transpile-module-transformer")(opts);
  const hasTranspilePath = typeof transpilePath =='string' && transpilePath && fs.existsSync(transpilePath);
  //@see : https://docs.expo.dev/versions/latest/config/metro/
  const config = getDefaultConfig(projectRoot,{
    // Enable CSS support.,
    isCSSEnabled: true,
    //mode: hasTranspilePath && 'exotic' || undefined,
  });
  if(hasTranspilePath){
    config.transformer.babelTransformerPath = transpilePath;
  }
  // 2. Let Metro know where to resolve packages and in what order
  const nodeModulesPaths = (Array.isArray(config.resolver.nodeModulesPaths)?config.resolver.nodeModulesPaths : []);
  const nodeModulePath = path.resolve(projectRoot, 'node_modules');
  if(!nodeModulesPaths.includes(nodeModulePath)){
    nodeModulesPaths.unshift(nodeModulePath);
  }
  config.resolver.nodeModulesPaths = nodeModulesPaths;
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
  config.watchFolders = Array.isArray(config.watchFolders)? config.watchFolders : [];
  const expoUIP = require("./expo-ui-path")(projectRoot);
  if(!config.watchFolders.includes(expoUIP)){
    config.watchFolders.push(expoUIP);
  }
  let hasFTO = false;
  for(let i in config.watchFolders){
      if(typeof config.watchFolders[i] ==="string" && config.watchFolders[i].includes("@fto-consult")){
        hasFTO = true;
      }
  }
  if(!hasFTO){
      config.watchFolders.push(path.resolve(projectRoot,"node_modules","@fto-consult"))
  }
  // 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
  config.resolver.disableHierarchicalLookup = true;
  
  // Remove all console logs in production...
  config.transformer.minifierConfig.compress.drop_console = false;
  
  return config;
}