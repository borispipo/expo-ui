const FileSaver = require('file-saver');
import {defaultNumber,postWebviewMessage} from "$cutils";
import {isReactNativeWebview} from "$cplatform";

/*** 
    sauvegarde par défaut un fichier blob
*/
export const save = ({content,fileName,mimeType,contentType,isBase64,timeout,delay})=>{
    return new Promise((resolve,reject)=>{
        try {
            if(isReactNativeWebview()){
                postWebviewMessage("FILE_SAVER_SAVE_FILE",{
                    content,
                    fileName,
                    contentType,
                    mimeType,
                    isBase64,
                });
            }
            FileSaver.saveAs(content, fileName);
            setTimeout(() => {
                resolve({path:fileName,isWeb : true});
            }, defaultNumber(timeout,delay,3000));
        } catch(e){
            reject(e);
        }
    })
}