module.exports = function(api,opts) {
    opts = typeof opts =='object' && opts ? opts : {};
    ///les chemin vers la variable d'environnement, le chemin du fichier .env,@see : https://github.com/brysgo/babel-plugin-inline-dotenv
    const environmentPath = opts.environmentPath || opts.envPath;
    const path = require("path");
    const dir = path.resolve(__dirname);
    api.cache(true);
    const alias =  require("./babel.config.alias")({base:dir,...opts,platform:"expo"});
    return {
      presets: [
        ['babel-preset-expo'],
        ["@babel/preset-react", {"runtime": "automatic"}],
      ],
      plugins : [
        ['babel-plugin-root-import', {"paths": alias}],
        ['react-native-reanimated/plugin'],
        ['transform-inline-environment-variables'],
        ['inline-dotenv',{
          ...(environmentPath?{path:environmentPath} : {})
        }]
      ]
    };
  };