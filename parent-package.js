// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

/**** cette fonction a pour rôle de retourner le package parent à celui ci */
module.exports = (()=>{
    const pathToParent = require("parent-package-json")(); // Will return false if no parent exists
    if (pathToParent !== false) {
        return pathToParent.path;
    }
    return "";
})();