import {isElectron} from "$cplatform";
export default function print(pdfMakeInstance,options){
    if(isElectron() && window?.ELECTRON && typeof window?.ELECTRON?.printPDF =='function'){
        return pdfMakeInstance.getBase64((content)=>{
            ELECTRON.printPDF({
                ...Object.assign({},options),
                content,
            })
        })
    }
    return pdfMakeInstance.print();
}