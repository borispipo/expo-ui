module.exports = function(api,opts) {
    opts = typeof opts =='object' && opts ? opts : {};
    api = api && typeof api =='object'? api : {};
    ///les chemin vers la variable d'environnement, le chemin du fichier .env,@see : https://github.com/brysgo/babel-plugin-inline-dotenv
    let environmentPath = opts.environmentPath || opts.envPath;
    //console.log(environmentPath," is envvv ",opts);
    const path = require("path");
    const fs = require("fs");
    const dir = path.resolve(__dirname);
    typeof api.cache =='function' && api.cache(true);
    const inlineDovOptions = {};
    const options = {base:dir,...opts,platform:"expo"};
    /*** par défaut, les variables d'environnements sont stockés dans le fichier .env situé à la racine du projet, référencée par la prop base  */
    if(!environmentPath || typeof environmentPath !== 'string'){
      const baseStr = typeof options.base =='string' && fs.existsSync(options.base)? options.base : typeof options.dir =='string' && fs.existsSync(options.dir)? options.dir : dir;
      environmentPath = path.resolve(baseStr,".env");
    } else {
      environmentPath = "";
    }
    if(environmentPath && fs.existsSync(environmentPath)){
      // File ".env" will be created or overwritten by default.
      try {
        fs.copyFileSync(environmentPath, path.resolve(dir,'.env'));
      }
      catch (e){
        inlineDovOptions.path = environmentPath;
      }
    }
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
        ['transform-inline-environment-variables'],
        ['react-native-reanimated/plugin'],
      ],
    };
  };