const path = require("path");
module.exports = function(api) {
    const projectRoot = process.cwd();
    const $src = path.resolve(projectRoot,"src");
    const alias = {
      $src,
      $components : path.resolve($src,"components"),
      $navigation : path.resolve($src,"navigation"),
      $screens : path.resolve($src,"screens"),
      //...your custom module resolver alias, @see : https://www.npmjs.com/package/babel-plugin-module-resolver
    }
    return require("@fto-consult/expo-ui/babel.config")(api,{
      alias,
      withPouchDB:false,//toggle support of pouchdb database,
    });
};
