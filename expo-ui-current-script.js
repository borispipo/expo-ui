// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

/*** permet de vérifier si le dossier expo-ui existe à la racine du projet si oui, 
 * en mode développement, c'est le contenu de ce dossier qui sera chargé pour faire référence au module 
 * @fto-consult/expo-ui, afin de faciliter le développement dudit package
 * @param {string} currentScriptFilePath - le chemin complet du script node en cours d'exécution
 * @return {boolean} qui détermine si le dossier local expo-ui est présent où non
 */
module.exports = (currentScriptFilePath)=>{
    const fs = require("fs");
    const path = require("path");
    const fileName = path.basename(currentScriptFilePath);
    const expoUIPath = require("./expo-ui-path");
    if(expoUIPath){
        const eP = path.resolve(expoUIPath,fileName);
        return fs.existsSync(eP) && eP != currentScriptFilePath ? eP : null;
    }
    return false;
}