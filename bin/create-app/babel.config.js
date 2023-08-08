module.exports = function(api) {
    const alias = {
      //your custom module resolver alias, @see : https://www.npmjs.com/package/babel-plugin-module-resolver
    }
    return require("@fto-consult/expo-ui/babel.config")(api,{
      base :dir,
      alias,
      withPouchDB:false,//toggle support of pouchdb database,
    })
};
