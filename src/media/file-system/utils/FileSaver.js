const FileSaver = require('file-saver');
import {defaultNumber} from "$cutils";

/*** 
    sauvegarde par défaut un fichier blob
*/
export const save = ({content,fileName,timeout,delay})=>{
    return new Promise((resolve,reject)=>{
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