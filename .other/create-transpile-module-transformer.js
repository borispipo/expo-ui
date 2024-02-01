const {writeFile} = require("../bin/utils");
const fs = require("fs"), path = require("path");
module.exports = function(opts){
    opts = typeof opts =='object'&& opts || {};
    const transpileModules = Array.isArray(opts.transpileModules)? opts.transpileModules : [];
    if(!transpileModules.includes('@fto-consult')){
        transpileModules.unshift('@fto-consult');
    }
    const transpilePath = path.resolve(__dirname,"./metro-exotic-transformer.js");
    try {
        writeFile(transpilePath,`
module.exports = require('@expo/metro-config/transformer')?.createExoticTransformer({
    transpileModules : ${JSON.stringify(transpileModules)},
})
        `);
    } catch(e) {
        console.log(e," generating metro-exotic-transformer on path ",transpilePath)
    }
    if(fs.existsSync(transpilePath)){
        return transpilePath;
    }
    return null;
}