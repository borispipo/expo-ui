const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const envManager = require("@expo/webpack-config/env");
const addons = require("@expo/webpack-config/addons");
const jsonfile = require('jsonfile');
const path = require("path");
const mode = 'development';
const isObj = x => x && typeof x =='object' && !Array.isArray(x);
/***@see : https://www.npmjs.com/package/@expo/webpack-config */
module.exports = async function(env, argv) {
  const projectRoot = process.cwd()
  const electronPath = path.join(projectRoot,'electron');
  env = env || {};
  env.projectRoot = projectRoot;
  env.platform = "electron";//isObj(env.platform)? env.platform : {};//'web'///electron;
  //env.platform.type = "electron";
  env.locations = (0, envManager.getPaths)(projectRoot)
  env.pwa = false;
  let config = (0, addons.withAlias)({}, (0, envManager.getAliases)(projectRoot));
  if(argv && typeof argv =='object' && (argv.mode =='production' || argv.mode =="development")){
    env.mode = argv.mode;
  } else {
      env.mode = mode;
  }
  config = await createExpoWebpackConfigAsync(env, argv);
  config.output = config.output || {};
  config.output.publicPath = "./";
  config.output.path = path.join(electronPath,"dist");
  if (!config.plugins) config.plugins = [];
  if (!config.resolve) config.resolve = {}; 
  for(let i in config.plugins){
      let pl = config.plugins[i];
      //on recherche le fichier html build de webpack
      if(pl && typeof pl =='object' && pl.options && typeof pl.options =='object'){
          if(typeof pl.options.filename =="string" && pl.options.filename.toLowerCase().includes("index.html")){
               pl.options.filename = path.join(config.output.path,"index.html");
               break;
          }
      }
  }
  //console.log(config.resolve.extensions, "is r extensions")
  config.resolve.extensions = (0, envManager.getModuleFileExtensions)('electron', 'web');
  //jsonfile.writeFileSync("electron/config.back.json", config, {spaces: 4});
  console.log("******electron config file generated**********");
  return config;
};