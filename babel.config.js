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
  require("@fto-consult/expo-ui/bin/generate-tables")();//génère les tables des bases de données
  return {
    presets: [
      ['babel-preset-expo']
    ],
    plugins : [
      ...(Array.isArray(opts.plugins) ? options.plugins : []),
      ["inline-dotenv",inlineDovOptions],
      ["module-resolver", {"alias": alias}],
      "@babel/plugin-proposal-export-namespace-from",
      'react-native-reanimated/plugin',
    ],
  };
};


