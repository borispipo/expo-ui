// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const fs = require("fs");
const path = require("path");
const { hideBin } = require('yargs/helpers')
const yargs = require('yargs/yargs');
///retourne le chemin vers le package @expo-ui
module.exports = function (...args){
    const argv = yargs(hideBin(process.argv)).argv
    let isBuild = false;
    const expoUIPath = "@fto-consult/expo-ui";
    if(typeof argv == 'object' && argv && !Array.isArray(argv)){
        for(let i in argv){
            let v = argv[i];
            if(typeof v !='string' || !v) continue;
            v = v.toLowerCase(); 
            i = (i+'').toLocaleLowerCase();
            if(i.includes("export") || v.includes('build') || v.includes('production') || v.includes('export') || v.includes('android')){
                isBuild = true;
                break;
            }
        }
    }
    const suffix = path.join(...args);
    const sep = path.sep;
    if(isBuild){
        const pp = suffix ? path.join(expoUIPath,suffix).replace(sep,"/") : expoUIPath;
        return pp;
    }
    const p = require("./lookup-expo-ui-path")();
    if(p && fs.existsSync(p)){
        const rootPath = path.resolve(p,"..");
        const src = path.resolve(rootPath,"src");
        if(fs.existsSync(src) && fs.existsSync((path.resolve(rootPath,"babel.config.js")))){
            return path.resolve(p,suffix).replace(sep,(sep+sep));
        }
    }
    return suffix ? path.join(expoUIPath,suffix).replace(sep,"/"): expoUIPath;
};

