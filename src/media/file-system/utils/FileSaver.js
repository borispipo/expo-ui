const FileSaver = require('file-saver');
import {defaultNumber} from "$cutils";

export const saveBlob = ({content,fileName,timeout,delay})=>{
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