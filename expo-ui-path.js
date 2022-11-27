// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const fs = require("fs");
const path = require("path");
const { hideBin } = require('yargs/helpers')
const yargs = require('yargs/yargs');
let pathRef = {current:null};
const metroConfig = "metro.config";
///retourne le chemin vers le package @expo-ui
module.exports = function (...args){
    const argv = yargs(hideBin(process.argv)).argv;
    const suffix = path.join(...args);
    const isMetroConfig = suffix && suffix.toLowerCase().includes(metroConfig);
    let isBuild = isMetroConfig ? false : pathRef.current ? true : false;
    let expoUIPath = isBuild ? pathRef.current : "@fto-consult/expo-ui";
    if(isMetroConfig && typeof argv == 'object' && argv && !Array.isArray(argv)){
        for(let i in argv){
            let v = argv[i];
            if(typeof v !='string' || !v) continue;
            v = v.toLowerCase(); 
            i = (i+'').toLocaleLowerCase();
            if(i != '$0'){
                if(v.includes('production') || v.includes('export') || v.includes('android')){
                    isBuild = true;
                    break;
                }
            }
        }
    }
    const sep = path.sep;
    if(isBuild){
        if(isMetroConfig){
            pathRef.current = expoUIPath;
        }
        const pp = suffix ? path.join(expoUIPath,suffix).replace(sep,"/") : expoUIPath;
        return pp;
    }
    const p = require("./lookup-expo-ui-path")();
    if(p && fs.existsSync(p)){
        const rootPath = path.resolve(p,"..");
        const src = path.resolve(rootPath,"src");
        if(fs.existsSync(src) && fs.existsSync((path.resolve(rootPath,"babel.config.js")))){
            if(isMetroConfig){
                pathRef.current = path.resolve(p);
            }
            return path.resolve(p,suffix).replace(sep,(sep+sep));
        }
    }
    return suffix ? path.join(expoUIPath,suffix).replace(sep,"/"): expoUIPath;
};

