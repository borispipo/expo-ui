const path = require("path");
const fs = require("fs");

module.exports = function(api,opts) {
  opts = typeof opts =='object' && opts ? opts : {};
  const platform = api.caller(caller => caller && caller.platform);
  const isWeb = platform === 'web';
  const options = {...opts,isWeb,isAndroid:platform==="android",isIos : platform==="ios",platform:"expo"};
  options.projectRoot = typeof options.projectRoot == 'string' && fs.existsSync(path.resolve(options.projectRoot)) ? path.resolve(options.projectRoot) : process.cwd();
  const alias =  require("./babel.config.alias")(options);
  if(typeof options.aliasMutator =="function"){
    options.aliasMutator({...options,alias});
  }
  const plugins = (Array.isArray(opts.plugins) ? options.plugins : []);
  let reanimated = "react-native-reanimated/plugin";
  const filteredPlugins = plugins.filter((p)=>{
    if(p === reanimated || Array.isArray(p) && p[0] === reanimated){
      reanimated = p;
      return false;
    }
    return true;
  })
  require("@fto-consult/common/bin/generate-jsonconfig")({...opts,alias});
  return {
    presets: [
      ...filteredPlugins,
      ['babel-preset-expo'],
    ],
    plugins : [
      ...plugins,
      ["module-resolver", {"alias": alias}],
      "@babel/plugin-proposal-export-namespace-from",
      ...(reanimated?[reanimated]:[]),
    ],
  };
};

