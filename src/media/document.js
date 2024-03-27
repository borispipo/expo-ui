import * as DocumentPicker from 'expo-document-picker';
import {extendObj} from "$cutils";
import notify from "$cnotify";

export const mimeTypes = {
    sql : "application/sql",
    json : "application/json",
    pdf : "application/pdf",
    xlsx : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    image : "image/*",
    xml : "application/xml",
    csv : "text/csv",
}
/****
    @param {object}, @see : https://docs.expo.dev/versions/latest/sdk/document-picker/#documentpickeroptions
    for mimeTypes, @see : https://en.wikipedia.org/wiki/Media_type
*/
export const pickDocument = (options)=>{
    options = extendObj({},{
        copyToCacheDirectory : true,
        multiple : false,
        type : undefined,
    },options);
    return new Promise((resolve,reject)=>{
        return DocumentPicker.getDocumentAsync(options).then(({canceled,...rest})=>{
            if(canceled){
                notify.error("Opération annulée par l'utilisateur");
                return reject({canceled});
            }
            return resolve({canceled,...rest});
        })
    })
}

export const pickJSON = (options)=>{
    return pickDocument(extendObj({},options,{
        type : mimeTypes.json,
    }));
}
export const pickCSV = (options)=>{
    return pickDocument(extendObj({},options,{
        type : mimeTypes.csv,
    }));
}
export const pickPDF = (options)=>{
    return pickDocument(extendObj({},options,{
        type : mimeTypes.pdf
    }));
}

export const pickSQL = (options)=>{
    return pickDocument(extendObj({},options,{
        type : mimeTypes.sql,
    }));
}
