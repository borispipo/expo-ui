// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {defaultStr,isNonNullString,defaultNumber,defaultBool,dataURLToBase64,isBlob,isBase64,isDataURL} from "$utils";
const FileSaver = require('file-saver');
const mime = require('mime-types')
/**** sauvegarde un fichier sur le disque 
     *  @param {object} {
     *      content {mix}: le contenu du fichier à enregistrer
     *      charset {string}: L'encodage à utiliser pour l'enregistrement du fichier, par défaut utf-8
     *      directory || dir {string} : le répertoire dans lequel enregistrer le fichier
     *      systemDirectory || SystemDirectory : le répertoire racine au device, où enregistrer la données
     *      fileName {string} : le nom du fichier à enregistrer
     *      success {function} : la fonction de rappel à appeler en cas de success
     *      error {function} la fonction de rappel à appeler en cas d'erreur
     *      isBinary : si c'est un fichier binaire
     *  }
    */
 export const write = ({content,type,isBinary,timeout,delay,share,contentType,filename,path,directory,fileName})=>{    
    share = defaultBool(share,true);
    fileName = sanitizeFileName(defaultStr(fileName,filename));
    contentType = defaultStr(contentType)  || mime.contentType(fileName) || mime.contentType(".txt");
    return new Promise((resolve,reject)=>{
        if(!isNonNullString(fileName)){
            reject({status:false,msg:'Nom de fichier invalide'});
            return;
        }
        content = isBlob(content)? content : new Blob(content,contentType);
        try {
            FileSaver.saveAs(blob, fileName);
            setTimeout(() => {
                resolve({path:fileName,isWeb : true});
            }, defaultNumber(timeout,delay,3000));
        } catch(e){
            reject(e);
        }
    })
}

export const writeText = (args)=>{
    return write({...args,contentType:mime.contentType(".txt")});
}