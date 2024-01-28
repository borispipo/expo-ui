const path = require("path");
const fs = require("fs");
const { getDefaultConfig } = require('@expo/metro-config');
module.exports = function(opts){
  opts = opts && typeof opts =='object'? opts : {};
  let {assetExts,sourceExts} = opts;
  assetExts = Array.isArray(assetExts)? assetExts: [];
  sourceExts= Array.isArray(sourceExts)?sourceExts : [];
  const projectRoot = path.resolve(process.cwd());
  const localDir = path.resolve(__dirname);
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
  
  // 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
  config.resolver.disableHierarchicalLookup = true;
  
  // Remove all console logs in production...
  config.transformer.minifierConfig.compress.drop_console = false;
  
  // 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`, @see : https://docs.expo.dev/guides/monorepos/
  config.resolver.disableHierarchicalLookup = true;
  
  return config;
}