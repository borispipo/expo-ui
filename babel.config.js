module.exports = function(api,opts) {
    opts = typeof opts =='object' && opts ? opts : {};
    const path = require("path");
    const dir = path.resolve(__dirname);
    api.cache(true);
    const alias =  require("./babel.config.alias")({base:dir,...opts,platform:"expo"});
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