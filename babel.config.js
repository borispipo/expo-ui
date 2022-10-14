module.exports = function(api,alias) {
    const path = require("path");
    const dir = path.resolve(__dirname);
    api.cache(true);
    alias = alias || require("./babel.config.alias")({base:dir,platform:"expo"});
    return {
      presets: [
        ['babel-preset-expo'],
        ["@babel/preset-react", {"runtime": "automatic"}],
      ],
      plugins : [
        ['babel-plugin-root-import', {"paths": alias}],
        ['react-native-reanimated/plugin'],
        ['transform-inline-environment-variables'],
      ]
    };
  };