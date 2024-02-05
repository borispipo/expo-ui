import {createPDF as cCreatePdf,print as cPrint,fields as pdfFields} from "$cpdf";
import Preloader from "$preloader";
import pdfMake from "$cpdf/pdfmake";
import notify from "$cnotify";
import DialogProvider from "$ecomponents/Form/FormData/DialogProvider";
import {isNonNullString,defaultObj,defaultStr,extendObj} from "$cutils";
import session from "$session";
import printPdfMake from "./print";
import appConfig from "$capp/config";
import Auth from "$cauth";


const {createPdf} = pdfMake;
pdfMake.createPdf = (docDefinition,...rest)=>{
    try {
        //@see : https://pdfmake.github.io/docs/0.1/getting-started/client-side/methods/
        const pdf = createPdf(docDefinition,...rest);
        printPdfMake(pdf,{...Object.assign({},docDefinition),...Object.assign({},rest[0])});
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

export const createPDF = (docDefinition,...rest)=>{
    return cCreatePdf(prepareOptions(docDefinition),pdfMake,...rest);
}

export const print = (data,options,...rest)=>{
    return cPrint(data,prepareOptions(options),pdfMake,...rest)
}

export const getFields = (config)=>{
    config = Object.assign({},config);
    const sFields = Object.clone(pdfFields);
    if(!isDataURL(config.logo)){
        delete sFields.displayLogo;
        delete sFields.logoWidth;
    }
    return sFields;
}

/**** get settings data
    @paramm {multiple}, 
    @param {object} formDataProps, les prpops à passer au DialogProvider
*/
export const getPrintSettings = ({multiple,duplicateDocOnPage,pageBreakBeforeEachDoc,sessionName,formDataProps,...rest})=>{
    formDataProps = Object.assign({},formDataProps);
    const hasSession = isNonNullString(sessionName);
    if(hasSession){
        sessionName = sessionName.trim();
    } else {
        sessionName = "";
    }
    const sessionData = hasSession ? defaultObj(session.get(sessionName)) : {};
    const config = {...sessionData,...defaultObj(formDataProps.data)};
    const fields = extendObj(true,{},formDataProps.fields,{
        duplicateDocOnPage : duplicateDocOnPage !== false ? {
            text :'Dupliquer le(s) document(s)',
            type : 'switch',
            defaultValue :  0,
            onValidate : ({value,context}) =>{
                if(context){
                    const pageBreakBeforeEachDoc = context.getField("pageBreakBeforeEachDoc");
                    const pageMarginAfterEachDoc = context.getField("pageMarginAfterEachDoc");
                    if(pageBreakBeforeEachDoc){
                        if(value || multiple){
                            pageBreakBeforeEachDoc.enable();
                        } else {
                            pageBreakBeforeEachDoc.disable();
                        }
                    }
                    if(pageMarginAfterEachDoc){
                        if(value || multiple){
                            pageMarginAfterEachDoc.enable();
                        } else {
                            pageMarginAfterEachDoc.disable();
                        }
                    }
                }
            }
        } : undefined,
        pageBreakBeforeEachDoc : pageBreakBeforeEachDoc !==false ? {
            text :'Saut de page par document',
            type : 'switch',
            defaultValue :  1,
            checkedTooltip : 'Insérer un saut de page avant chaque nouveau document',
            uncheckedTooltip : 'Ne pas insérer un saut de page avant chaque nouveau document',
            getValidValue : ({context,data}) => {
                if(!context || !context?.isDisabled) return;
                const v = context?.isDisabled()?0 : context.getValue();
                if(isObj(data)){
                    data.pageBreakBeforeEachDoc = v;
                }
                return v;
            }
        } : null,
        pageMarginAfterEachDoc : duplicateDocOnPage !== false ? {
            text : "Marge après chaque document",
            tooltip : 'Spécifiez le nombre de ligne à ajouter comme marge après chaque document',
            defaultValue : 2,
            type : "number",
            getValidValue : ({context,data}) => {
                if(!context || !context?.isDisabled) {
                    return 0;
                }
                const v = context?.isDisabled()?0 : context.getValue();
                if(isObj(data)){
                    data.pageMarginAfterEachDoc = v;
                }
                return v;
            }
        } : undefined,
    },getFields(formDataProps.data))
    return new Promise((resolve,reject)=>{
        return DialogProvider.open({
            title : "Options d'impression",
            ...formDataProps,
            isPrintingForm : true,
            data : config,
            fields,
            onSuccess : (opts)=>{
                const {data} = opts;
                if(hasSession){
                    const sessionD = {};
                    for(let i in fields){
                        sessionD[i] = data[i];
                    }
                    session.set(sessionName,sessionD);
                }
                DialogProvider.close();
                resolve({...opts,data:{...config,...data},fields});
            },
            onCancel : (e)=>{
                reject(e);
                Preloader.close();
            },
        })
    });
}

/**** permet d'imprimer une table data 
    @param {Array<object>||object}, la/les donnée(s) à imprimer
    @param {object<{
        table|tableName {string}, le nom de la table data à utilser pour l'impression
        print {funtion}, la fonction à utiliser pour faire l'impression, si cette fonction n'est pas définie, alors la table data lié à la table doit l'implémenter dans l'option print
    }>}
    @return Promise
*/
export function printTableData(data,options){
    options = Object.assign({},options);
    const table = defaultStr(options.table,options.tableName);
    const tableObj = appConfig.getTable(table);
    if(!table || !tableObj){
        return Promise.reject({message:`Vous devez spécifier la table pour laquelle vous souhaitez effectuer l'impression des données`})
    }    
    const tableText = defaultStr(tableObj.label,tableObj.text,table);
    const tablePrint = typeof options.print =="function"? options.print : typeof tableObj.print =="function"? tableObj.print : undefined;
    if(!tablePrint){
        return Promise.reject({message : `La fonction d'impression n'est pas supportée par la table [${tableText}]`})
    }
    if(!Auth.isTableDataAllowed({table,action:'print'})){
        return Promise.reject({message:'Vous n\'etes pas autorisé à imprimer ce type de document'});
    }
    const printOptions = typeof tableObj.printOptions =="function"? tableObj.printOptions({...options,table,data}) : tableObj.printOptions;
    return print(data,{
        getSettings : (options)=>{
            return getPrintSettings(extendObj(true,{},{sessionName:`print-${table}`},options,printOptions)).then(({data})=>{
                return data;
            });
        },
        print : tablePrint,
        ...Object.assign({},options),
    });
}
