// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const fs = require("fs");
const path = require("path");
///retourne le chemin vers le package @expo-ui
module.exports = function (...args){
    const suffix = path.join(...args);
    const expoUIPath = "@fto-consult/expo-ui";
    const sep = path.sep;
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

