// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const fs = require("fs");
const path = require("path");
const dir = path.resolve(__dirname)
const lookupForExpoUIPath = ()=>{
    let level = 4; //jusqu'à 4 niveaux
    let expoUIPath= null;
    let rootPath = path.resolve(dir);
    while(level>0 && !expoUIPath){
        const p = path.resolve(rootPath,"expo-ui");
        const nPath = path.resolve(rootPath,"node_modules");
        const srcPath = path.resolve(rootPath,"src");
        const babelPath = path.resolve(rootPath,"babel.config.js");
        if(fs.existsSync(p) && fs.existsSync(nPath) && fs.existsSync(srcPath) && fs.existsSync(babelPath)){
            expoUIPath = p;
            return expoUIPath;
        }
        rootPath = path.resolve(rootPath,"..");
        level = level-1;
    }
    return expoUIPath;
}
///retourne le chemin vers le package @expo-ui
module.exports = (()=>{
    const isDevFile = path.resolve(dir,"expo-ui-production-path.js");
    const expoUIPath = lookupForExpoUIPath();
    try {
        var writeStream = fs.createWriteStream(isDevFile);
        writeStream.write("module.exports=\""+(expoUIPath||"@fto-consult/expo-ui")+"\";");
        writeStream.end();
    } catch{}
    return expoUIPath;
})();