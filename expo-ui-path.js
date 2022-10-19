// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const fs = require("fs");
const path = require("path");
const dir = path.resolve(__dirname)
let devExpoUIPath = path.resolve(dir);
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
console.log(lookupForExpoUIPath()," is lookup path");
///retourne le chemin vers le package @expo-ui
module.exports = (()=>{
    const isDev = fs.existsSync(devExpoUIPath) && fs.existsSync(path.resolve(devExpoUIPath,"babel.config.alias.js"))
    && fs.existsSync(path.resolve(devExpoUIPath,"src"));
    const isDevFile = path.resolve(dir,"expo-ui-production-path.js");
    const expoUIPath = isDev ? "./expo-ui" : "@fto-consult/expo-ui"
    try {
        var writeStream = fs.createWriteStream(isDevFile);
        writeStream.write("module.exports=\""+expoUIPath+"\";");
        writeStream.end();
    } catch{
        if(fs.existsSync(isDevFile)){
            try {
                fs.rmSync(isDevFile);
            } catch{}
        }
    }
    return expoUIPath;
})();