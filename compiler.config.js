const path = require("path");
module.exports = function({config,nodeModulesPath}){
    const base = process.cwd();
    const expoUi = path.resolve(require("./expo-ui-path")());
    nodeModulesPath = Array.isArray(nodeModulesPath)? nodeModulesPath : [];
    config.resolve.modules = Array.isArray(config.resolve.modules)? config.resolve.modules:[]
    config.resolve.modules = [path.resolve(base, 'node_modules'), 'node_modules',...nodeModulesPath,...config.resolve.modules];
    config.module.rules.push({
        test: /\.(js|jsx|ts|tsx)$/,
        include: [
            base,
            path.resolve(expoUi,"node_modules","@fto-consult"),
            /(common)/
        ],
        exclude:[
            path.resolve(base,"nodes_modules"),
            path.resolve(expoUi,"node_modules"),
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