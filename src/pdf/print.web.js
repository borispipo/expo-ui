import {isElectron} from "$cplatform";
import electronPrint from "./print.electron";
export default function print(pdfMakeInstance,options,...rest){
    if(isElectron()){
        return electronPrint(pdfMakeInstance,options,...rest);
    }
    return pdfMakeInstance.print(options,...rest);
}