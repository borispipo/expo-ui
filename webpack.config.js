/**@see : https://www.npmjs.com/package/@expo/webpack-config/v/0.11.4 */
const createExpoWebpackConfigAsync = require('@expo/webpack-config')
// Expo CLI will await this method so you can optionally return a promise.
module.exports = async function(env, argv,opts) {
    const script = require("./expo-ui-current-script")(__filename);
    if(script){
      console.log("has found local webpack.config.js on expo-ui dev path ",script);
      return require(script)(env, argv,opts);
    }
    const path = require("path");
    const dir = path.resolve(__dirname);
    const fs = require("fs");
    const fileName = path.basename(__filename);
    const expoUIPath = require("./expo-ui-path");;
    if(expoUIPath){
       const eP = path.resolve(expoUIPath,fileName);
       if(fs.existsSync(eP) && eP != __filename){
          console.log("***** loading webpack config",eP,"babel config file")
          return require(ep)(env,argv,opts);
       }
    }
    opts = typeof opts =="object" && opts ? opts : {};
    const transpileModules = Array.isArray(opts.transpileModules)? opts.transpileModules : [];
    const config = await createExpoWebpackConfigAsync(
      {
        ...env,
        babel: {
          dangerouslyAddModulePathsToTranspile: [
            // Ensure that all packages starting with @fto-consult are transpiled.
            '@fto-consult',
            ...transpileModules,
          ],
        },
      },
      argv
  );
    //config.resolve.alias['moduleA'] = 'moduleB';
  
    // Maybe you want to turn off compression in dev mode.
    if (config.mode === 'development') {
      config.devServer.compress = false;
    }
    // Or prevent minimizing the bundle when you build.
    if (config.mode === 'production') {
      config.optimization.minimize = true;
    }
    require("./compiler.config.js")({config,...opts,dir})
    return config;
};