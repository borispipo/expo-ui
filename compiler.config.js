const path = require("path");
module.exports = function({config,isNext,nodeModulesPath,base,dir}){
    const root = path.resolve(dir,"..");
    base = base || dir;
    nodeModulesPath = Array.isArray(nodeModulesPath)? nodeModulesPath : [];
    config.resolve.modules = Array.isArray(config.resolve.modules)? config.resolve.modules:[]
    config.resolve.modules = [path.resolve(dir, 'node_modules'),path.resolve(root, 'node_modules'), 'node_modules',...nodeModulesPath,...config.resolve.modules];
    config.module.rules.push({
        test: /\.(js|jsx|ts|tsx)$/,
        include: [
            dir,
            base,
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
    config.plugins.push(require("@fto-consult/common/circular-dependencies"));
    return config;
}