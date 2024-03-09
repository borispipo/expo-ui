const FileSaver = require('file-saver');
import {defaultNumber,postWebviewMessage,canPostWebviewMessage,logRNWebview,WEBVIEW_SAVE_FILE_EVENT} from "$cutils";

/*** 
    sauvegarde par défaut un fichier blob
*/
export const save = ({content,fileName,mimeType,contentType,isBase64,timeout,delay})=>{
    return new Promise((resolve,reject)=>{
        try {
            if(canPostWebviewMessage()){
                logRNWebview("SAVE RN FILE FROM WEBVIEWddd ",fileName,mimeType,contentType);
                postWebviewMessage(WEBVIEW_SAVE_FILE_EVENT,{
                    content,
                    fileName,
                    contentType,
                    mimeType,
                    isBase64,
                });
            } else {
                FileSaver.saveAs(content, fileName);
            }
            setTimeout(() => {
                resolve({path:fileName,isWeb : true});
            }, defaultNumber(timeout,delay,3000));
        } catch(e){
            reject(e);
        }
    })
}