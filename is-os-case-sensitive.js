// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const path = require("path");
const dir = path.resolve(__dirname);
const fs = require("fs");

/*** check weather os is case sensitive 
 * @see : https://stackoverflow.com/questions/27367261/check-if-file-exists-case-sensitive/52908385#52908385
*/
function fileExistsWithCaseSync(filepath) {
    var dir = path.dirname(filepath);
    if (dir === '/' || dir === '.') return true;
    var filenames = fs.readdirSync(dir);
    if (filenames.indexOf(path.basename(filepath)) === -1) {
        return false;
    }
    return fileExistsWithCaseSync(dir);
}

/***vérifie si le système supporte la cassse où non 
 * c'est à dire si 2 noms de fichiers ayant la case différentes sont considérés comme le même où pas
*/
module.exports = (()=>{
    return fileExistsWithCaseSync(path.resolve(dir,"metro.config.js")) == fileExistsWithCaseSync(path.resolve(dir,"Metro.config.js"))
})();