const path = require("path");
module.exports = (opts)=>{
    const dir = path.resolve(__dirname);
    const expo = path.resolve(dir,"src");
    const assets = path.resolve(dir,"assets");
    opts = typeof opts =='object' && opts ? opts : {};
    opts.platform = "expo";
    opts.assets = opts.assets || assets;
    opts.base = opts.base || dir;
    const alias = require("@fto-consult/common/babel.config.alias");
    const r = alias(opts);
    r["$expo"] = r["$expo-ui"] = expo;
    r["$ecomponents"] = path.resolve(expo,"components");
    r["$elayouts"] = path.resolve(expo,"layouts");
    r["$emedia"] = path.resolve(expo,"media");
    r["$escreen"] = path.resolve(expo,"screen");
    r["$escreens"] = path.resolve(expo,"screens");
    r["$enavigation"] = path.resolve(expo,"navigation");
    const aliases = [];
    for(let i in r){
        aliases.push({
            root: r[i],
            rootPathPrefix: i,
            rootPathSuffix: '',
        })
    }
    return aliases;
}