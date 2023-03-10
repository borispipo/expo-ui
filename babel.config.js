module.exports = function(api,opts) {
    opts = typeof opts =='object' && opts ? opts : {};
    api = api && typeof api =='object'? api : {};
    ///les chemin vers la variable d'environnement, le chemin du fichier .env,@see : https://github.com/brysgo/babel-plugin-inline-dotenv
    //console.log(environmentPath," is envvv ",opts);
    const path = require("path");
    const fs = require("fs");
    const dir = path.resolve(__dirname);
    typeof api.cache =='function' && api.cache(true);
    const inlineDovOptions = { unsafe: true};
    const options = {base:dir,...opts,platform:"expo"};
    const environmentPath = require("./copy-env-file")();
    if(fs.existsSync(environmentPath)){
      inlineDovOptions.path ='./.env';
    }
    /*** par défaut, les variables d'environnements sont stockés dans le fichier .env situé à la racine du projet, référencée par la prop base  */
    
    const alias =  require("./babel.config.alias")(options);
    return {
      presets: [
        ['babel-preset-expo'],
        ["@babel/preset-react", {"runtime": "automatic"}],
      ],
      plugins : [
        ["inline-dotenv",inlineDovOptions],
        ["module-resolver", {"alias": alias}],
        ['@babel/plugin-proposal-export-namespace-from'],
        ['transform-inline-environment-variables',{
          "include": [
            "NODE_ENV"
          ]
        }],
        ['react-native-reanimated/plugin'],
      ],
    };
  };