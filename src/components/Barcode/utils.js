
import {defaultNumber,isNonNullString} from "$cutils";
import Preloader from "$preloader";
import JsBarcode from "jsbarcode";
import { toDataURL } from "./Generator/utils";

/*** permet de generer une liste des codes barres à partir des props passés en paramètre
*/
export function generate ({startSequence,onFinish,barcodeTemplate,barcodeOptions,endSequence,generate}){
    startSequence = Math.ceil(defaultNumber(startSequence,1));
    endSequence = Math.ceil(defaultNumber(endSequence,startSequence+1));
    if(startSequence > endSequence) {
        return Promise.reject({
         message : `Impossible de généner les codes barres car la séquence de début ${startSequence} est supérieure à la sequence de fin ${endSequence}`
        });
    }
    const promises = [],data = [];;
    barcodeOptions = defaultObj(barcodeOptions);
    delete barcodeOptions.value;
    delete barcodeOptions.text;
    const length = (endSequence-startSequence)+1;
    const prefix = `Génération de ${length.formatNumber()} code barres`;
    Preloader.open(`${prefix}....`);
    generate = typeof generate =='function'? generate : x=>undefined;
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            for(let sequence=startSequence;sequence<=endSequence;sequence++){
                promises.push(new Promise((resolve)=>{
                    const hasSerializer = typeof window?.XMLSerializer !=="undefined" && window?.XMLSerializer; 
                    const canvas = document.createElement(hasSerializer ? 'svg':'img');
                    const b = generate({sequence,template:barcodeTemplate,barcodeTemplate});
                    const barcode = isNonNullString(b)? b : defaultStr(barcodeTemplate);//.replaceAll("{sequence}",sequence)
                    if(barcode){
                        Preloader.open(`${prefix} [${barcode}]...`)
                        try {
                            JsBarcode(canvas,barcode,barcodeOptions);
                            if(hasSerializer){
                                const serializer = new XMLSerializer();
                                const svg = serializer.serializeToString(canvas);
                                const ret = {svg,barcode};
                                data.push(ret)
                                return resolve(ret);
                            }
                            return toDataURL(canvas).then((ret)=>{
                                ret = {...ret,barcode};
                                data.push(ret)
                                resolve(ret)
                            }).catch((e)=>{
                                console.log(e," converting ",barcode," to data url")
                                resolve({message:`Unable to convert barcode ${barcode} to dataURL`,status:false})
                            })
                        } catch(e){
                            console.log(e," occurred on generating barcode ",barcode," for sequence ",sequence);
                            resolve({error:e})
                        }
                    } else {
                        resolve({message:`Invalid barcode for sequence ${sequence}`,sequence,barcode})
                    }
                }));
            }
            return Promise.all(promises).then((allD)=>{
                resolve(data);
            }).catch((e)=>{
                console.log(e," generation barcode");
                reject(e);
            }).finally(Preloader.close);
        },500);
    });
}