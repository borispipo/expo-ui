export default function print(pdfMakeInstance,...rest){
    console.log("printint electron pdf make ",rest);
    return pdfMakeInstance.print(...rest);
}