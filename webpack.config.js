/**@see : https://www.npmjs.com/package/@expo/webpack-config/v/0.11.4 */
const createExpoWebpackConfigAsync = require('@expo/webpack-config')
const path = require("path");
const isObj = x => x && typeof x =='object' && !Array.isArray(x);
const webpack = require("webpack");
const fs = require("fs");
const writeFile = require("./electron/utils/writeFile");
const supportedPlatforms = ["web","electron"];
// Expo CLI will await this method so you can optionally return a promise.
module.exports = async function(env, argv,opts) {
    env = env || {};
    opts = typeof opts =="object" && opts ? opts : {};
    const babel = isObj(opts.babel)? opts.babel : {};
    const isElectron = process.env.isElectron || process.env.platform =="electron" || typeof env.platform =="string" && env.platform.toLowerCase().trim() ==='electron';
    if(isElectron){
       env.platform = "electron";
       env.mode = env.mode =="production" && "production" || "development";
       env.pwa = false;
    }
    const platform = isElectron && "electron" || process.env.platform && supportedPlatforms.includes(process.platform) && process.platform || typeof opts.platform =="string" && supportedPlatforms.includes(opts.platform)? opts.platform : "web";
    //writeFile(path.resolve(__dirname,"is-electron-platform.txt"),`platform = ${process.env.platform} and is electron = true ${process.env.isElectron}`)
    const transpileModules = Array.isArray(opts.transpileModules)? opts.transpileModules : [];
    const projectRoot = opts.projectRoot && typeof opts.projectRoot =="string" && fs.existsSync(opts.projectRoot) && opts.projectRoot || process.cwd();
    const config = await createExpoWebpackConfigAsync(
      {
        ...env,
        platform,
        projectRoot,
        babel: {
          ...babel,
          dangerouslyAddModulePathsToTranspile: [
            // Ensure that all packages starting with @fto-consult are transpiled.
            '@fto-consult',
            ...transpileModules,
          ],
        },
      },
      argv
    );
    config.module.rules.push(
      {
          test: /.mjs$/,
          include: /node_modules/,
          type: "javascript/auto",
          use: {loader: 'babel-loader'}
    });
    //config.resolve.alias['moduleA'] = 'moduleB';
    config.mode = (config.mode =="development" || config.mode =='production') ? config.mode  : "development";
    // Maybe you want to turn off compression in dev mode.
    if (config.mode === 'development') {
      config.devServer.compress = false;
    }
    // Or prevent minimizing the bundle when you build.
    if (config.mode === 'production') {
      config.optimization.minimize = true;
    }
    config.performance = typeof config.performance =="object" && config.performance ? config.performance : {};
    config.performance.hints = "hints" in config.performance ? config.performance.hints : false;
    config.performance.maxEntrypointSize = typeof config.performance.maxEntrypointSize =='number'? config.performance.maxEntrypointSize : 512000;
    config.performance.maxAssetSize = typeof config.performance.maxAssetSize =='number'? config.performance.maxAssetSize : 512000;
    config.devtool = (config.mode === 'development') ? 'inline-source-map' : false;
    require("./compiler.config.js")({config,...opts});
    // fix "process is not defined" error:
    config.plugins.push(new webpack.ProvidePlugin({
      process: 'process/browser',
    }));
    if(isElectron){
      const electronPath = process.cwd();
      config.output = config.output || {};
      config.output.publicPath = "./";
      config.output.path = path.join(electronPath,"dist");
    }
    return config;
};