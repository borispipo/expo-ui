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
    const expoUIPath = "@fto-consult/expo-ui";
    const sep = path.sep;
    const rootPath = process.cwd();
    const src = path.resolve(rootPath,"src");
    const expoUi = path.resolve(rootPath,"expo-ui");
    if(fs.existsSync(src) && fs.existsSync(expoUi) && fs.existsSync(path.resolve(expoUi,"webpack.config.js"))){
        return path.resolve(expoUi,suffix).replace(sep,(sep+sep));
    }
    return suffix ? path.join(expoUIPath,suffix).replace(sep,"/"): expoUIPath;
};

