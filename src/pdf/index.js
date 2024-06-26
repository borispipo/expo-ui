import {createPDF as cCreatePdf,print as cPrint,fields as pdfFields} from "$cpdf";
import Preloader from "$preloader";
import pdfMake from "$cpdf/pdfmake";
import notify from "$cnotify";
import DialogProvider from "$ecomponents/Form/FormData/DialogProvider";
import {isNonNullString,defaultObj,defaultStr,extendObj,defaultNumber,isJSON} from "$cutils";
import session from "$session";
import printPdfMake from "./print";
import appConfig from "$capp/config";
import Auth from "$cauth";
import DateLib from "$clib/date";
import crypToJS from "$clib/crypto-js";
import { isPermAllowed } from "$eauth/utils";

export const QR_CODE_HASH_KEY_PREFIX = defaultStr(appConfig.name).replace(/\s/g, "");
export const QR_CODE_HASH_KEY = `${QR_CODE_HASH_KEY_PREFIX}-QR_CODE_HASH_KEY`;//la clé de décryptage du QRCODE


/****
    génère la valeur haschée de la données d'un qrCode
*/
export const hashQRCode = (data)=>{
    try {
        return crypToJS.encode(JSON.stringify(data),QR_CODE_HASH_KEY).toString()
    } catch(Exception){
        return null;
    }
}

export const decryptQRCodeData = (hashedQRCode)=>{
    try {
        return crypToJS.decode(hashedQRCode,QR_CODE_HASH_KEY);
    } catch {
        return null;
    }
}

export const isValidQRCode = (data)=>{
    if(isJSON(data)){
        data = JSON.parse(data);
    }
    data = defaultObj(data);
    data.data = decryptQRCodeData(data.data);
    if(!data.data || !isJSON(data.data)) return false;
    return QR_CODE_HASH_KEY_PREFIX.toLowerCase() == defaultStr(data.provider).toLowerCase().replace(/\s/g, "");
}
export const decryptQRCode = (data)=>{
    if(isJSON(data)){
        data = JSON.parse(data);
    }
    data = defaultObj(data);
    if(!isValidQRCode(data)) return null;
    return data;
}

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
export const getPrintSettings = ({multiple,duplicateDocOnPage,printQRCode,isTableData,tableDataFields,pageBreakBeforeEachDoc,sessionName,formDataProps,...rest})=>{
    formDataProps = Object.assign({},formDataProps);
    const hasSession = isNonNullString(sessionName);
    if(hasSession){
        sessionName = sessionName.trim();
    } else {
        sessionName = "";
    }
    const sessionData = hasSession ? defaultObj(session.get(sessionName)) : {};
    const config = {...sessionData,...defaultObj(formDataProps.data)};
    const tbFields = {}, tbPrimaryKeyFields = [];
    Object.map(tableDataFields,(field,index)=>{
        if(!isObj(field)) return;
        tbFields[index] = field;
        if(!!field.primaryKey){
            tbPrimaryKeyFields.push(index);
        }
    });
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
        ...(isTableData && printQRCode !== false && tbPrimaryKeyFields.length ?{
            printQRCode : {
                type : "switch",
                label : "Imprimer un QR Code",
                tooltip : "Cochez la case pour inclure un QR Code dans la données imprimée",
                defaultValue : 0,
            },
            qrCodeFields : {
                type : "select",
                label : "Champs à inclure dans le QR Code",
                multiple : true,
                items : tbFields,
                filter : ({item,index})=>isObj(item),
                itemValue : ({item,index})=>index,
                defaultValue : tbPrimaryKeyFields,
                onValidatorValid : ({value})=>{
                    if(!Array.isArray(value) || !value.length) return true;
                    for(let i in tbPrimaryKeyFields){
                        const p = tbPrimaryKeyFields[i];
                        if(!value.includes(p)){
                            return `Le champ [${p}] en temps que clé primaire doit figurer parmis les champs à imprimer dans le QR Code.`;
                        }
                    }
                    return true;
                },
                renderItem : ({item,index})=>{
                    return `[${index}] ${defaultStr(item.label,item.text)}`;
                }
            },
            qrCodeAlignmentPosition : {
                type : "select",
                defaultValue : "center",
                label : "Position du QR Code",
                multiple : false,
                items : [{code:"left",label:"A gauche"},{code:"center",label:"Au centre"},{code:"right",label:"A droite"}]
            },
            qrCodeFitSize : {
                type :"number",
                defaultValue : 120,
                label : "Taille du QR Code",
                validType : "numberGreaterThanOrEquals[120]"
            },
        }:{})
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
        perm {function|string}, la fonction permettant de vérifier l'accès à la fonction d'impression par l'utilisateur
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
    if((options.perm !== undefined && !isPermAllowed(options.perm,{...options,table,tableObj,permAction:'print',tableName:table,data}))){
        return Promise.reject({message:'Vous n\'etes pas autorisé à imprimer ce type de document'});
    } else if(!Auth.isTableDataAllowed({table,action:'print'})){
        return Promise.reject({message:'Vous n\'etes pas autorisé à imprimer ce type de document'});
    }
    return print(data,{
        getSettings : (options)=>{
            const printOptions = typeof tableObj.printOptions =="function"? tableObj.printOptions({...options,table}) : tableObj.printOptions;
            return getPrintSettings(extendObj(true,{},{sessionName:`print-${table}`,isTableData:true,tableDataFields:defaultObj(options.tableDataFields,tableObj.printableFields,tableObj.fields)},options,printOptions)).then(({data})=>{
                return data;
            });
        },
        print : (data,...rest)=>{
            return Promise.resolve(tablePrint(data,...rest)).then((result)=>{
                if(!!data?.printQRCode && Array.isArray(data?.qrCodeFields) && data.qrCodeFields.length && isObj(result) && Array.isArray(result.content) && isObj(data?.data)){
                    const qrCodeFields = data.qrCodeFields;
                    const printingData = data.data;
                    const qrCodeAlignmentPosition = defaultStr(data.qrCodeAlignmentPosition,"center");
                    const qrData = {};
                    let hasQRData = false;
                    qrCodeFields.map((f)=>{
                        if(f in printingData){
                            qrData[f] = ["number","boolean"].includes(typeof printingData[f])? printingData[f] : JSON.stringify(printingData[f]);
                            hasQRData = true;
                        }
                    });
                    if(hasQRData){
                        const uEmail = Auth.getUserEmail();
                        const pseudo = Auth.getUserPseudo();
                        const fullName = Auth.getUserFullName() || pseudo || Auth.getLoggedUserCode();
                        const printBy = isNonNullString(fullName)? (`${fullName}${uEmail?`[${uEmail}]`:""}`) : "";
                        result.content.push({ qr: JSON.stringify({data:hashQRCode(qrData),provider:defaultStr(appConfig.name).replace(/\s/g, ""),printBy,printDate:new Date().toFormat(DateLib.defaultDateTimeFormat),tableName:table}),margin:[0,8,0,5], fit: defaultNumber(data.qrCodeFitSize,120), alignment: qrCodeAlignmentPosition})
                    }
                }
                return result;
            });
        },
        ...Object.assign({},options),
    });
}
