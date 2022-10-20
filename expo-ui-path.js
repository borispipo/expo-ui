// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const fs = require("fs");
const path = require("path");
const dir = path.resolve(__dirname)
///retourne le chemin vers le package @expo-ui
module.exports = function (...args){
    const suffix = path.join(...args);
    const p = lookupForExpoUIPath();
    const sep = path.sep;
    if(p && fs.existsSync(p)){
        const rootPath = path.resolve(p,"..");
        const src = path.resolve(rootPath,"src");
        if(fs.existsSync(src) && fs.existsSync((path.resolve(rootPath,"babel.config.js")))){
            const expoUIPath = path.resolve(rootPath,"expo-ui-build-path.js");
            try {
                var writeStream = fs.createWriteStream(expoUIPath);
                writeStream.write("module.exports=\"./expo-ui/\";");
                writeStream.end();
                return path.resolve(p,suffix).replace(sep,(sep+sep));
            } catch{
                if(fs.existsSync(expoUIPath)){
                    try {
                        fs.rmSync(expoUIPath);
                    } catch{}
                }
            }
        }
    }
    return suffix ? path.join("@fto-consult/expo-ui",suffix).replace(sep,"/"):"@fto-consult/expo-ui";
};

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