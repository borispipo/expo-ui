// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const fs = require("fs");
const path = require("path");
const dir = path.resolve(__dirname)
///retourne le chemin vers le package @expo-ui
module.exports = function (){
    const arguments = Array.prototype.slice.call(arguments,0);
    let suffix = "";
    arguments.map(a=>{
        if(typeof a =='string' && a){
            suffix+=(suffix?(path.resolve(suffix,a)):a);
        }
    });
    console.log("suffix is suffix heinn ",suffix)
    const p = lookupForExpoUIPath();
    if(p && fs.existsSync(p)){
        const rPath = path.resolve(p,"..");
        const src = path.resolve(rPath,"src");
        if(fs.existsSync(src) && fs.existsSync((path.resolve(rPath,"babel.config.js")))){
            const expoUIPath = path.resolve(p,"expo-ui-path.js");
            try {
                var writeStream = fs.createWriteStream(rPath);
                writeStream.write("module.exports=\""+(p.replace(path.sep,(path.sep+path.sep)))+(path.sep+path.sep)+"\";");
                writeStream.end();
                return path.resolve(p,suffix);
            } catch{
                if(fs.existsSync(expoUIPath)){
                    try {
                        fs.rmSync(expoUIPath);
                    } catch{}
                }
            }
        }
    }
    return path.resolve("@fto-consult/expo-ui",suffix);
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