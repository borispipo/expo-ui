import {isElectron} from "$cplatform";
import electronPrint from "./print.electron";
import {isTouchDevice} from "$cplatform";
import {canPostWebviewMessage,postWebviewMessage,logRNWebview,WEBVIEW_SAVE_FILE_EVENT} from "$cutils/rn-webview";
import {defaultStr,getFileExtension} from "$cutils";
import DateLib from "$clib/date";
export default function print(pdfMakeInstance,options,...rest){
    if(isElectron()){
        return electronPrint(pdfMakeInstance,options,...rest);
    }
    if(canPostWebviewMessage()){
        alert("printing pdf, check if can post react native webview message ? "+canPostWebviewMessage());
        let fileName = defaultStr(options?.fileName);
        if(!fileName){
            fileName = "printed-pdf-"+DateLib.format(new Date(),"dd-mm-yyyy HH MM ss");
        }
        logRNWebview(`will print native webview on filename +`+fileName);
        return pdfMakeInstance.getBase64((content)=>{
            const ext = getFileExtension(fileName,true);
            if(!ext || ext.toLowerCase() !=="pdf"){
                fileName+=".pdf";
            }
            logRNWebview("printing pdf file",options?.fileName,WEBVIEW_SAVE_FILE_EVENT);
            return postWebviewMessage(WEBVIEW_SAVE_FILE_EVENT,{
                content,
                contentType : 'application/pdf',
                fileName,
                isBase64 : true,
            });
        })
    }
    if(isTouchDevice()){
        return pdfMakeInstance.open({},window);
    }
    return pdfMakeInstance.print({...options,...rest});
}