/**@see : https://www.npmjs.com/package/@expo/webpack-config */
const isObj = x => x && typeof x =='object' && !Array.isArray(x);
//const webpack = require("webpack");
const fs = require("fs");
const supportedPlatforms = ["web","electron"];
const mainExtensions = [".js", ".jsx",".ts",".tsx",".mjs"];
const path = require("path");

// Expo CLI will await this method so you can optionally return a promise.
module.exports = async function(env, argv,opts) {
  const nodeModulePath = `${process.cwd()}/node_modules`;
  const wConfigPath = fs.existsSync(`${nodeModulePath}/@expo/webpack-config`) && `${nodeModulePath}/@expo/webpack-config` || "@expo/webpack-config";
  const webpackPath = fs.existsSync(`${nodeModulePath}/webpack`) && `${nodeModulePath}/webpack` || "webpack";
  const webpack = require(`${webpackPath}`);
  const createExpoWebpackConfigAsync = require(wConfigPath);
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
    const envPath = require("./copy-env-file")();
    const extensions = config.resolve.extensions;
    if(isElectron){
      mainExtensions.map((ex)=>{
        const nExt =  `.electron${ex}`;
        if(!extensions.includes(nExt)){
          extensions.unshift(nExt);
        }
      });
      //const electronPath = process.cwd();
      //config.output = config.output || {};
      //config.output.publicPath = "./";
      //config.output.path = path.join(electronPath,"dist");
      //writeFile(path.resolve(__dirname,"is-electron-platform.txt"),` ${JSON.stringify(extensions)} is extensions to resolve`)
    }
    //fix process is not defined
    config.plugins.unshift(new webpack.ProvidePlugin({
      process: 'process/browser',
    }));
    config.resolve.alias.process = "process/browser";
    config.resolve.fallback = typeof config.resolve.fallback =="object" && config.resolve.fallback || {};
    config.resolve.fallback = {...config.resolve.fallback,process: require.resolve('process/browser')};
    return config;
};;