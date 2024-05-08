// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const fs = require("fs");
const path = require("path");
const {JSONManager} = require("@fto-consult/node-utils");
///retourne le chemin vers le package @expo-ui
module.exports = function (projectRoot){
    const sep = path.sep;
    if(require("./is-local-dev")()){//le programme s'exécute en environnement fix bugs sur electron
        return path.resolve(__dirname).replace(sep,(sep+sep));///pour la résolution du module expo-ui en mode test
    }
    const isDev = String(process.env.NODE_ENV).toLowerCase().trim() !="production";
    projectRoot = typeof projectRoot =='string' && fs.existsSync(path.resolve(projectRoot)) && path.resolve(projectRoot) || process.cwd();
    const packageJSON = path.resolve(projectRoot,"package.json");
    const expoUIPath = path.resolve(projectRoot,"node_modules","@fto-consult","expo-ui");
    if(isDev && fs.existsSync(packageJSON)){
        const pM = JSONManager(packageJSON);
        if(pM.hasPackage){
            const expoUIRootPath = pM.get("expoUIRootPath");
            if(typeof expoUIRootPath =="string" && expoUIRootPath){
                const p = path.resolve(expoUIRootPath);
                const pM2 = JSONManager(path.resolve(expoUIRootPath,"package.json"));
                if(pM2.hasPackage && pM2.get("name") =="@fto-consult/expo-ui" && fs.existsSync(p) && fs.existsSync(path.resolve(p,"src"))){
                    return p;
                }
            }
        }
    }
    return expoUIPath;
};