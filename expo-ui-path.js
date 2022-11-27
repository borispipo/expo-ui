// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const fs = require("fs");
const path = require("path");
///retourne le chemin vers le package @expo-ui
module.exports = function (...args){
    const argv = require('yargs-parser')(process.argv?.slice(2))
    let isBuild = false;
    const expoUIPath = "@fto-consult/expo-ui";
    if(typeof argv == 'object' && argv && !Array.isArray(argv)){
        for(let i in argv){
            i = (i+"").toLowerCase(); 
            if(i.includes('build') || i.includes('production') || i.includes('export') || i.includes('android')){
                isBuild = true;
                break;
            }
        }
    }
    if(isBuild){
        return expoUIPath;
    }
    const suffix = path.join(...args);
    const p = require("./lookup-expo-ui-path")();
    const sep = path.sep;
    if(p && fs.existsSync(p)){
        const rootPath = path.resolve(p,"..");
        const src = path.resolve(rootPath,"src");
        if(fs.existsSync(src) && fs.existsSync((path.resolve(rootPath,"babel.config.js")))){
            return path.resolve(p,suffix).replace(sep,(sep+sep));
        }
    }
    return suffix ? path.join(expoUIPath,suffix).replace(sep,"/"): expoUIPath;
};

