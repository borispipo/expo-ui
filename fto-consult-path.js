// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const fs = require("fs");
const path = require("path");
const {JSONManager} = require("@fto-consult/node-utils");
///retourne le chemin vers le package @expo-ui
/***
 * @param {string} projectRoot, le project root
 * @param {string} moduleName, le module name
 * @param {string} packageKey, la clé dans le package
 */
module.exports = function (projectRoot,moduleName,packageKey){
    const isDev = String(process.env.NODE_ENV).toLowerCase().trim() !="production";
    projectRoot = typeof projectRoot =='string' && fs.existsSync(path.resolve(projectRoot)) && path.resolve(projectRoot) || process.cwd();
    const packageJSON = path.resolve(projectRoot,"package.json");
    const ftoConsultPath = path.resolve(projectRoot,"node_modules",moduleName);
    if(isDev && fs.existsSync(packageJSON)){
        const pM = JSONManager(packageJSON);
        if(pM.hasPackage){
            const moduleRoutePath = pM.get(packageKey);
            if(typeof moduleRoutePath =="string" && moduleRoutePath){
                const p = path.resolve(moduleRoutePath);
                const pM2 = JSONManager(path.resolve(moduleRoutePath,"package.json"));
                if(pM2.hasPackage && pM2.get("name") == moduleName && fs.existsSync(p)){
                    return p;
                }
            }
        }
    }
    return ftoConsultPath;
};