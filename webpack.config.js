/**@see : https://www.npmjs.com/package/@expo/webpack-config */
const isObj = x => x && typeof x =='object' && !Array.isArray(x);
//const webpack = require("webpack");
const fs = require("fs");
const supportedPlatforms = ["web","electron"];
const mainExtensions = [".js", ".jsx",".ts",".tsx",".mjs"];
const path = require("path");

// Expo CLI will await this method so you can optionally return a promise.
module.exports = async function(env, argv,opts) {
  const isLocalDev = require("./is-local-dev")();//si l'application est en developpement local
  const nodeModulePath = path.resolve(`${process.cwd()}`,"node_modules");
  const localNodeEuiP = path.resolve(nodeModulePath,"@expo/webpack-config");
  const wConfigPath = fs.existsSync(localNodeEuiP) && localNodeEuiP || "@expo/webpack-config";
  const createExpoWebpackConfigAsync = require(wConfigPath);
    env = env || {};
    opts = typeof opts =="object" && opts ? opts : {};
    const babel = isObj(opts.babel)? opts.babel : {};
    const isElectron = process.env.isElectron || process.env.platform =="electron" || typeof env.platform =="string" && env.platform.toLowerCase().trim() ==='electron';
    const isNeutralino = process.env.isNeutralino || process.env.platform =="neutralino";
    if(isElectron || isNeutralino){
       env.platform = isElectron ? "electron":"neutralino";
       env.mode = env.mode =="production" && "production" || "development";
       env.pwa = false;
    }
    const platform = isElectron && "electron" || isNeutralino && "neutralino" || process.env.platform && supportedPlatforms.includes(process.platform) && process.platform || typeof opts.platform =="string" && supportedPlatforms.includes(opts.platform)? opts.platform : "web";
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
    const extensions = config.resolve.extensions;
    if(isElectron || isNeutralino){
      mainExtensions.map((ex)=>{
        const nExt =  `.${isElectron?"electron":"neu"}${ex}`;
        if(!extensions.includes(nExt)){
          extensions.unshift(nExt);
        }
      });
    }
    config.resolve.fallback = {
      ...Object.assign({},config.resolve.fallback),
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
    }
    return config;
};;