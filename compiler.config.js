const path = require("path");
module.exports = function({config,isNext,nodeModulesPath,dir}){
    const root = path.resolve(dir,"..");
    nodeModulesPath = Array.isArray(nodeModulesPath)? nodeModulesPath : [];
    config.resolve.modules = Array.isArray(config.resolve.modules)? config.resolve.modules:[]
    config.resolve.modules = [path.resolve(dir, 'node_modules'),path.resolve(root, 'node_modules'), 'node_modules',...nodeModulesPath,...config.resolve.modules];
    if(!isNext){
        config.module.rules.push({
            test: /\.(js|jsx|ts|tsx)$/,
            include: [
                dir,
                path.resolve(dir,"node_modules","@fto-consult"),
                /(common)/
            ],
            exclude:[
                path.resolve(dir,"node_modules"),
                path.resolve(root,"node_modules"),
                /node_modules[/\\](?!react-native-paper|react-native|react-native-vector-icons|react-native-safe-area-view)/,
                /(node_modules)/
            ],
            use: {
              loader: 'babel-loader',
            }
        });
    }
    config.plugins.push(require("./circular-dependencies"));
    return config;
}