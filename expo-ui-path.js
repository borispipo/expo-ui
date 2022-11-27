// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const fs = require("fs");
const path = require("path");
///retourne le chemin vers le package @expo-ui
module.exports = function (...args){
    const argv = require('args-parser')(process.argv);
    console.log(argv," is argvvvvvvvv");    
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
    return suffix ? path.join("@fto-consult/expo-ui",suffix).replace(sep,"/"):"@fto-consult/expo-ui";
};

