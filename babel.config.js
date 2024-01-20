module.exports = function(api,opts) {
  opts = typeof opts =='object' && opts ? opts : {};
  api = api && typeof api =='object'? api : {};
  ///les chemin vers la variable d'environnement, le chemin du fichier .env,@see : https://github.com/brysgo/babel-plugin-inline-dotenv
  //console.log(environmentPath," is envvv ",opts);
  const path = require("path");
  const fs = require("fs");
  typeof api.cache =='function' && api.cache(true);
  const inlineDovOptions = { unsafe: true};
  const options = {...opts,platform:"expo"};
  const environmentPath = require("./copy-env-file")();
  if(environmentPath && fs.existsSync(environmentPath)){
    inlineDovOptions.path ='./.env';
  }
  /*** par défaut, les variables d'environnements sont stockés dans le fichier .env situé à la racine du projet, référencée par la prop base  */
  const alias =  require("./babel.config.alias")(options);
  require(`${path.resolve(__dirname,"bin","generate-tables")}`)();//génère les tables des bases de données
  const plugins = (Array.isArray(opts.plugins) ? options.plugins : []);
  let reanimated = "react-native-reanimated/plugin";
  const filteredPlugins = plugins.filter((p)=>{
    if(p === reanimated || Array.isArray(p) && p[0] === reanimated){
      reanimated = p;
      return false;
    }
    return true;
  })
  return {
    presets: [
      ...filteredPlugins,
      ['babel-preset-expo'],
    ],
    plugins : [
      ...plugins,
      ["inline-dotenv",inlineDovOptions],
      ["module-resolver", {"alias": alias}],
      "@babel/plugin-proposal-export-namespace-from",
      ...(reanimated?[reanimated]:[]),
    ],
  };
};


