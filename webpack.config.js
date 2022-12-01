/**@see : https://www.npmjs.com/package/@expo/webpack-config/v/0.11.4 */
const createExpoWebpackConfigAsync = require('@expo/webpack-config')
// Expo CLI will await this method so you can optionally return a promise.
module.exports = async function(env, argv,opts) {
    const path = require("path");
    const dir = path.resolve(__dirname);
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
    config.mode = config.mode =="development" || config.mode =='production' && config.mode  || "development";
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