// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
///retourne le chemin vers le package @expo-ui
module.exports = function (projectRoot){
    return require("./fto-consult-path")(projectRoot,"@fto-consult/expo-ui","expoUIRootPath");
};