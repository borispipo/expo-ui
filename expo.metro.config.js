const { getDefaultConfig } = require('@expo/metro-config');
const path = require("path");
module.exports = (opts)=>{
  opts = opts && typeof opts =='object'? opts : {};
  let {dir,nodeModulesPaths} = opts;
  nodeModulesPaths = Array.isArray(nodeModulesPaths)? nodeModulesPaths : [];
  dir = dir || path.resolve(__dirname);
  const projectRoot = path.resolve(dir);
  const workspaceRoot = path.resolve(projectRoot, '../..');
  const config = getDefaultConfig(projectRoot);
  config.watchFolders = [workspaceRoot];
  // 2. Let Metro know where to resolve packages and in what order
  config.resolver.nodeModulesPaths = [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
      path.resolve(dir,"node_modules"),
      ...nodeModulesPaths,
    ];
  config.resolver.assetExts.push('db');
  config.resolver.sourceExts = [
      ...config.resolver.sourceExts,
      'jsx', 'js','tsx'
  ]
  // 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
  config.resolver.disableHierarchicalLookup = true;
  module.exports = config;
}