const alias = require("./common/babel.config.alias");
const path = require("path");
module.exports = (opts)=>{
    const dir = path.resolve(__dirname);
    const assets = path.resolve(dir,"assets");
    opts = typeof opts =='object' && opts ? opts : {};
    opts.platform = "expo";
    opts.assets = opts.assets || assets;
    const r = alias(opts);
    r["$econtainers"] = r ["$containers"];;
    r["$ecomponents"] = r ["$components"];;
    r["$elayouts"] = r["$layouts"];;
    r["$ecomponents"] = r["$components"];
    r["$econtainers"] = r["$containers"];
    if(r["$screens"]){
        r["$escreens"] = r["$screens"];
    }
    if(r["$Screen"]){
        r["$eScreen"] = r["$Screen"];
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