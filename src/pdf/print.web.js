import {isElectron} from "$cplatform";
import electronPrint from "./print.electron";
import {isTouchDevice} from "$cplatform";
export default function print(pdfMakeInstance,options,...rest){
    if(isElectron()){
        return electronPrint(pdfMakeInstance,options,...rest);
    }
    if(isTouchDevice()){
        return pdfMakeInstance.open({},window);
    }
    return pdfMakeInstance.print({...options,...rest});
}