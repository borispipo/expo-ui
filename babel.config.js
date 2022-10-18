module.exports = function(api,opts) {
    opts = typeof opts =='object' && opts ? opts : {};
    ///les chemin vers la variable d'environnement, le chemin du fichier .env,@see : https://github.com/brysgo/babel-plugin-inline-dotenv
    const environmentPath = opts.environmentPath || opts.envPath;
    const path = require("path");
    const fs = require("fs");
    const dir = path.resolve(__dirname);
    api.cache(true);
    const inlineDovOptions = {};
    if(environmentPath && typeof environmentPath =='string' && fs.existsSync(environmentPath)){
      // File ".env" will be created or overwritten by default.
      try {
        fs.copyFileSync(environmentPath, path.resolve(dir,'.env'));
      }
      catch (e){
        inlineDovOptions.path = environmentPath;
      }
    }
    const alias =  require("./babel.config.alias")({base:dir,...opts,platform:"expo"});
    return {
      presets: [
        ['babel-preset-expo'],
        ["@babel/preset-react", {"runtime": "automatic"}],
      ],
      plugins : [
        ["inline-dotenv",inlineDovOptions],
        ['babel-plugin-root-import', {"paths": alias}],
        ['react-native-reanimated/plugin'],
        ['transform-inline-environment-variables'],
      ],
    };
  };