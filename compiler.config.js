const path = require("path");
module.exports = function({config,nodeModulesPath}){
    const base = process.cwd();
    const expoUi = path.resolve(require("./expo-ui-path")());
    nodeModulesPath = Array.isArray(nodeModulesPath)? nodeModulesPath : [];
    config.resolve.modules = Array.isArray(config.resolve.modules)? config.resolve.modules:[]
    config.resolve.modules = [path.resolve(base, 'node_modules'),path.resolve(expoUi,"node_modules"),...nodeModulesPath,...config.resolve.modules];
    config.module.rules.push({
        test: /\.(js|jsx|ts|tsx)$/,
        type: "javascript/auto",
        include: [
            base,
            /node_modules\/@fto-consult/,
            expoUi,
        ],
        exclude:[
            /node_modules[/\\](?!react-native-paper|react-native|react-native-vector-icons|react-native-safe-area-view)/,
        ],
        use: {
          loader: 'babel-loader',
        },
    });
    config.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
        resolve: {
          fullySpecified: false
        }
    });
    config.plugins.push(require("@fto-consult/common/circular-dependencies"));
    return config;
}