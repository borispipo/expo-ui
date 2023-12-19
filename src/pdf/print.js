import {isElectron} from "$cplatform";
export default function print(pdfMakeInstance,options,...rest){
    if(isElectron() && ELECTRON.printPDF){
        return ELECTRON.printPDF(options);
    }
    return pdfMakeInstance.print(options,...rest);
}