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
    const sep = path.sep;
    if(require("./is-local-dev")()){//le programme s'exécute en environnement fix bugs sur electron
        return path.resolve(__dirname,suffix).replace(sep,(sep+sep));///pour la résolution du module expo-ui en mode test
    }
    const isDevEnv = process?.env?.WEBPACK_SERVE && 'development' === process.env.NODE_ENV;
    const packageJSON = path.resolve(process.cwd(),"package.json");
    const expoUIPath = path.resolve(process.cwd(),"node_modules","@fto-consult","expo-ui");
    if(isDevEnv && fs.existsSync(packageJSON)){
        try {
            const package = require(`${packageJSON}`);
            if(package && typeof package =='object' && package?.expoUIRootPath && typeof package.expoUIRootPath ==='string'){
                const p = path.resolve(package.expoUIRootPath);
                if(fs.existsSync(p) && fs.existsSync(path.resolve(p,"src")) && fs.existsSync(path.resolve(p,"webpack.config.js"))){
                    return path.resolve(p,suffix).replace(sep,(sep+sep));
                }
            }
            
        } catch (e){}
    }
    /***** old dev env */
    return suffix ? path.join(expoUIPath,suffix).replace(sep,"/"): expoUIPath;
};