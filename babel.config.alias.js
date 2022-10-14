const path = require("path");
module.exports = (opts)=>{
    const dir = path.resolve(__dirname);
    const expo = path.resolve(dir,"src");
    const assets = path.resolve(dir,"assets");
    opts = typeof opts =='object' && opts ? opts : {};
    opts.platform = "expo";
    opts.assets = opts.assets || assets;
    opts.base = opts.base || dir;
    const r = require("@fto-consult/common/babel.config.alias")(opts);
    r["$ecomponents"] = path.resolve(expo,"components");
    r["$elayouts"] = path.resolve(expo,"layouts");
    r["$emedia"] = path.resolve(expo,"media");
    r["$enavigation"] = path.resolve(expo,"navigation");
    r["$escreens"] = path.resolve(expo,"screens");
    r["$escreen"] = path.resolve(expo,"layouts/Screen");
    r["$expo"] = r["$expo-ui"] = expo;
    if(typeof opts.mutator =='function'){
        opts.mutator(r);
    }
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