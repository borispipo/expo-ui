// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {defaultStr,isNonNullString,getFileName,getFileExtension,defaultNumber,defaultBool,dataURLToBase64,isBlob,isBase64,isDataURL} from "$utils";
const FileSaver = require('file-saver');
const mime = require('mime-types')
const XLSX = require("xlsx");
import Preloader from "$preloader";
import Base64 from "$base64";

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
 export const write = ({content,type,isBinary,timeout,delay,share,contentType,path,directory,fileName})=>{    
    share = defaultBool(share,true);
    fileName = sanitizeFileName(fileName);
    contentType = defaultStr(contentType)  || mime.contentType(fileName) || mime.contentType(".txt");
    return new Promise((resolve,reject)=>{
        if(!isNonNullString(fileName)){
            reject({status:false,msg:'Nom de fichier invalide'});
            return;
        }
        content = isBlob(content)? content : new Blob([content], { type: content?.type||contentType})
        try {
            FileSaver.saveAs(content, fileName);
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
function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}
/***
 * @see https://ourtechroom.com/tech/mime-type-for-excel/ for excel mimesTypes
 * .xls	 : application/vnd.ms-excel
 */
export const writeExcel = ({workbook,content,contentType,fileName,...rest})=>{
    if(!isNonNullString(contentType) || !contentType.contains("application/vnd.")){
        //contentType = "application/vnd.ms-excel";
        contentType : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }
    let ext = defaultStr(getFileExtension(fileName,true),"xlsx");
    fileName = sanitizeFileName(getFileName(fileName,true))+"."+ext;
    if(!isNonNullString(fileName)){
        return Promise.reject({status:false,message:'Nom de fichier invalide pour le contenu excel à créer'});
    }
    if(isBlob(content)){
        return write({...rest,content,fileName,contentType})
    }
    Preloader.open("génération du fichier excel "+fileName);
    XLSX.writeFile(workbook, fileName);
    setTimeout(()=>{
        Preloader.close();
    },1000);
}
/*** @see : https://stackoverflow.com/questions/34993292/how-to-save-xlsx-data-to-file-as-a-blob */
function base64toBlob(base64Data, contentType) {
    contentType = contentType || '';
    let sliceSize = 1024;
    let byteCharacters = atob(base64Data);
    let bytesLength = byteCharacters.length;
    let slicesCount = Math.ceil(bytesLength / sliceSize);
    let byteArrays = new Array(slicesCount);
    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        let begin = sliceIndex * sliceSize;
        let end = Math.min(begin + sliceSize, bytesLength);

        let bytes = new Array(end - begin);
        for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
}


