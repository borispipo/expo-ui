// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const fs = require("fs");
const path = require("path");
///retourne le chemin vers le package @expo-ui
module.exports = function (){
    const ag = Array.prototype.slice.call(arguments,0);
    let suffix ="";
    ag.map(p=>{
        if(typeof p ==='string' && p){
            suffix = path.join(suffix,p);
        }
    })
    const expoUIPath = path.resolve(process.cwd(),"node_modules","@fto-consult","expo-ui");
    const sep = path.sep;
    if(path.resove(process.cwd()) === path.resolve(__dirname)){//le programme s'exécute en environnement fix bugs sur electron
        return path.resolve(__dirname,suffix).replace(sep,(sep+sep));///pour la résolution du module expo-ui en mode test
    }
    const rootPath = process.cwd();
    const src = path.resolve(rootPath,"src");
    try {
        const envObj = require("./parse-env")();
        const euPathm = typeof envObj.EXPO_UI_ROOT_PATH =="string" && envObj.EXPO_UI_ROOT_PATH && path.resolve(envObj.EXPO_UI_ROOT_PATH)||'';
        const eu = euPathm && fs.existsSync(euPathm)? euPathm : null;
        if(eu &&  fs.existsSync(path.resolve(eu,"src")) && fs.existsSync(path.resolve(eu,"webpack.config.js"))){
            return path.resolve(eu,suffix).replace(sep,(sep+sep));
        }
    } catch{}
    const expoUi = path.resolve(rootPath,"expo-ui");
    if(fs.existsSync(src) && fs.existsSync(expoUi) && fs.existsSync(path.resolve(expoUi,"webpack.config.js"))){
        return path.resolve(expoUi,suffix).replace(sep,(sep+sep));
    }
    return suffix ? path.join(expoUIPath,suffix).replace(sep,"/"): expoUIPath;
};

