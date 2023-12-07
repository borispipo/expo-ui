import {createPDF as cCreatePdf,print as cPrint,fields as pdfFields} from "$cpdf";
import Preloader from "$preloader";
import {extendObj} from "$cutils";
import pdfMake from "$cpdf/pdfmake";
import notify from "$cnotify";

const {createPdf} = pdfMake;
pdfMake.createPdf = (docDefinition,...rest)=>{
    try {
        //@see : https://pdfmake.github.io/docs/0.1/getting-started/client-side/methods/
        const pdf = createPdf(docDefinition,...rest);
        pdf.print();
        //pdf.open({}, window)
        return pdf;
    } catch(e){
        console.log(e," generating pdf make create eerrror");
        notify.error(e);
        return null;
    }
}

const prepareOptions = options =>{
    options = Object.assign({},options);
    if(typeof options.showPreloader !='function'){
        options.showPreloader = Preloader.open;
    }
    if(typeof options.hidePreloader !=='function'){
        options.hidePreloader = Preloader.close;
    }
    return options;
}

export const createPDF = (docDefinition,options,...rest)=>{
    return cCreatePdf(docDefinition,prepareOptions(options),pdfMake,...rest);
}

export const print = (data,options,...rest)=>{
    return cPrint(data,prepareOptions(options),pdfMake,...rest)
}

export const getFields = (config)=>{
    config = Object.assign({},config);
    const sFields = extendObj({},{
        pdfDocumentTitle : {
            text : "Titre du document",
            multiple : true,
        }
    },pdfFields);
    delete sFields.code;
    delete sFields.label;
    if(!isDataURL(config.logo)){
        delete sFields.displayLogo;
        delete sFields.logoWidth;
    }
    return sFields;
}