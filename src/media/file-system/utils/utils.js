// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
import {defaultStr,base64toBlob,dataURLToBlob,getTypeFromDataURL,isNonNullString,getFileName,getFileExtension,defaultNumber,defaultBool,dataURLToBase64,isBlob,isBase64,isDataURL,canPostWebviewMessage} from "$cutils";
const mime = require('react-native-mime-types')
const XLSX = require("xlsx");
import Preloader from "$preloader";
import * as FileSaver from "./FileSaver";
import {isMobileNative,isElectron} from "$cplatform";

/**** sauvegarde un fichier sur le disque 
     *  @param {object} {
     *      content {mix}: le contenu du fichier à enregistrer
     *      charset {string}: L'encodage à utiliser pour l'enregistrement du fichier, par défaut utf-8
     *      directory || dir {string} : le répertoire dans lequel enregistrer le fichier
     *      systemDirectory || SystemDirectory : le répertoire racine au device, où enregistrer la données
            path {string}, le chemin de sauvegarde des données
     *      fileName {string} : le nom du fichier à enregistrer
     *      success {function} : la fonction de rappel à appeler en cas de success
     *      error {function} la fonction de rappel à appeler en cas d'erreur
     *      isBinary : si c'est un fichier binaire
     *  }
    */
 export const write = ({content,type,contentType,fileName,...rest})=>{    
    fileName = sanitizeFileName(fileName);
    contentType = defaultStr(contentType)  || mime.contentType(fileName) || mime.contentType(".txt");
    if(!isNonNullString(fileName)){
        return Promise.reject({status:false,msg:'Nom de fichier invalide'});
    }
    const isNative = isMobileNative() || isElectron();
    if(isBase64(content)){
       if(isNative){
         return FileSaver.save({content,contentType,isBase64:true,fileName,...rest});
       }
       content = new Blob([base64toBlob(content,contentType)], {});
    } else if(isDataURL(content)){
        if(isNative){
            return FileSaver.save({content:dataURLToBase64(content),contentType,mime:contentType,isBase64:true,fileName,...rest});
        }
        const type = getTypeFromDataURL(content);
        content = dataURLToBlob(content);
        if(isNonNullString(type)){
            contentType = type;
        }
    }
    return FileSaver.save({content:isBlob(content)? content : new Blob([content], { type: content?.type||contentType}),fileName,contentType,...rest})
}

export const writeText = (args)=>{
    return write({...args,contentType:mime.contentType(".txt")});
}

/***
 * @see https://ourtechroom.com/tech/mime-type-for-excel/ for excel mimesTypes
 * .xls	 : application/vnd.ms-excel
   @see : https://docs.sheetjs.com/docs/demos/mobile/reactnative
 */
export const writeExcel = ({workbook,content,contentType,fileName,...rest})=>{
    let ext = defaultStr(getFileExtension(fileName,true),"xlsx");
    fileName = sanitizeFileName(getFileName(fileName,true))+"."+ext;
    if(!isNonNullString(fileName)){
        return Promise.reject({status:false,message:'Nom de fichier invalide pour le contenu excel à créer'});
    }
    const isNative = isMobileNative() || isElectron();
    Preloader.open("génération du fichier excel "+fileName);
    if(isBase64(content)){
        if(isNative) return FileSaver.save({content,isBase64:true,contentType,fileName,...rest}).finally(Preloader.close);
        content = new Blob([base64toBlob(content, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')], {});
    }
    if(isBlob(content)){
        return write({...rest,content,fileName,contentType}).finally(Preloader.close)
    }
    if(isNative || canPostWebviewMessage()){
        return FileSaver.save({...rest,content:XLSX.write(workbook, {type:'base64', bookType:ext}),fileName}).finally(Preloader.close).finally(Preloader.close);
    }
    return new Promise((resolve,reject)=>{
        try {
            XLSX.writeFile(workbook, fileName);
            setTimeout(()=>{
                resolve({fileName});
            },1000);
        } catch(e){
            reject(e);
        } finally{
            Preloader.close();
        }
    })
}

/***
 * @see https://ourtechroom.com/tech/mime-type-for-excel/ for excel mimesTypes
 * .xls	 : application/vnd.ms-excel
 */
export const writeImage = ({content,fileName,...rest})=>{
    let ext = defaultStr(getFileExtension(fileName,true),"png");
    fileName = sanitizeFileName(getFileName(fileName,true))+"."+ext;
    if(!isNonNullString(fileName)){
        return Promise.reject({status:false,message:'Nom de fichier invalide pour le contenu excel à créer'});
    }
    
}


export {FileSaver};