module.exports = function(){
  const isElectron = process.env.isElectronScript || process.env.isElectron;
  const path = require("path");
  const fs = require("fs");
  const { getDefaultConfig } = require('@expo/metro-config');
  const projectRoot = path.resolve(process.cwd());
  const transpilePath = null;
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
     "db",
     "txt"
  ];
  ["txt",'tsx','ts','jsx', 'js','cjs','mjs'].map((ex)=>{
    if(!config.resolver.sourceExts.includes(ex)){
      config.resolver.sourceExts.push(ex);
    }
  });
  if(isElectron){
     config.resolver.sourceExts = [
       ...config.resolver.sourceExts.map((ex)=>{
        return `electron.${ex}`;
       }),
       ...config.resolver.sourceExts,
     ]
  }
  config.watchFolders = Array.isArray(config.watchFolders)? config.watchFolders : [];
  const expoUIP = require("./expo-ui-path")(projectRoot);
  const cPath = require("./common-path")(projectRoot);
  if(!config.watchFolders.includes(expoUIP)){
    config.watchFolders.push(expoUIP);
  }
  if(cPath && !config.watchFolders.includes(cPath)){
      config.watchFolders.push(cPath);
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
  
  require(path.resolve(__dirname,"bin/find-licenses"))(projectRoot);
  
  return config;
}