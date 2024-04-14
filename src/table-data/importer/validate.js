import getSelectFieldValue from "./getSelectFieldValue";
import appConfig from "$capp/config";

export default function validate(args){
    let {data,requiredFields,index,fields,table,tableText}= defaultObj(args)
    data = defaultObj(data);
    requiredFields = defaultArray(requiredFields);
    if(!isObj(fields)) return "champs de validation incorects";
    for(let i in fields){
        let field = fields[i];
        if(!isObj(field)) continue;
        let code = defaultStr(i,field.code);
        let label = defaultStr(field.label,field.text,i);
        let v = data[code];
        let isFieldSelected = arrayValueExists(requiredFields,code);
        let type = defaultStr(field.type,'text').toLowerCase().trim();
        let validType  = defaultStr(field.validType).toLowerCase();
        let lSuffix = isNonNullString(tableText)? ("["+tableText+"]"):"";
        let labelStr = (isNonNullString(v) || isNumber(v) ? (" la valeur <"+v+"> du champ ") : "le champ ")+label+lSuffix+"";
        labelStr += (index)? (", ligne "+index):""
        let isIdField = type == 'id' || type =="piece";

        /**** les donées passés en paramètre de type tableau */
        if(type.contains("select")){
            if(field.multiple){
                v = isArray(v)? v : (v?(v+""):"").split(",");
            } else v = defaultStr(v);
            let itemCodes = "";
            let itemsL = Object.size((isObjOrArray(field.items)? field.items : [])) > 0 ? true : false;
            let hasF = true;
            let isSelectTableData = type == "selecttabledata";
            if(isArray(v)){
                let arr = [];
                v.map((value)=>{
                    if(itemsL){
                        let _v = getSelectFieldValue({field,value});
                        itemCodes = defaultStr(itemCodes,_v.itemCodes);
                        if(_v.value !== false){
                            arr.push(_v.value);
                        }
                    } else if(isNonNullString(value)) {
                        arr.push(isSelectTableData? value.toUpperCase():value)
                    }
                });
                hasF = arr.length > 0 ? true : false;
                v = arr;
            } else {
                if(itemsL){
                    let _v = getSelectFieldValue({field,value:v});
                    itemCodes = _v.itemCodes;
                    hasF = _v.value !== false? true : false;
                    if(hasF){
                        v = _v.value;
                    }
                }
                if(isSelectTableData && hasF){
                    v = v.toUpperCase();
                }
                //eif(isFieldSelected) console.log(hasF, code,_v,' is value');
            }
            if(isFieldSelected && !hasF && itemCodes){
                return labelStr+" doit figurer parmi la liste : ["+itemCodes+"]";
            } 
        }

        if((isIdField || validType.contains("required") || field.required)){
            if(isIdField && isNonNullString(data.table)){
            } else if(v == undefined || v == null || v =='' || (isArray(v) && v.length <= 0)) {
                return labelStr+" est requis";
            }
        }
        if(isIdField  && isNonNullString(v)){
            v = v.trim();
            if(!isValidDataFileName(v.replaceAll("/",""))) return labelStr+" a une valeur invalide";
        }
        if(type =="datafile" && v && !APP.DATA_FILE_MANAGER.get(v)){
            return labelStr+ ", le "+APP.DATA_FILE_MANAGER.dataFileText+" "+defaultStr(v) +" est innexistant"
        }
        if((type =="number" || type=="decimal" || validType.contains("number") || validType.contains("decimal"))){
            if(!isNumber(v)){
                v = parseDecimal(v);
                if(!isNumber(v) && isFieldSelected){
                    return labelStr+" doit être un nombre";
                } else {
                    v = defaultDecimal(v);
                }
            }
        }
        
        if(type =='email' && v && !isValidEmail(v,false)){
            return labelStr+" doit être un email valide";
        }
        if(type == 'date' && v){
            let date = APP.date.toDateObj(v,true);
            if(!date || !date.date){
                return labelStr+" doit être une date valide au format yyyy-mm-dd";
            }
        }
        if(type == 'time' && v && !APP.date.isValidSQLTime(v)){
            return labelStr+" doit être une heure valide au format hh:mm:ss";
        }
        
        let strValid = labelStr+" doit être une chaine de caractère non nulle ";
        if(isNumber(field.length) && isNonNullString(v) && v.length != field.length){
            return strValid+" de "+field.length + " caractères";
        }
        if(isNumber(field.minLength) && isNonNullString(v) && v.length < field.minLength){
            return strValid+" de "+field.minLength+" caractères minimum";
        }
        if(isNumber(field.maxLength) && isNonNullString(v) && v.length > field.maxLength){
            return strValid+" de "+field.maxLength+" caractères maximum";
        }
        if(type =='switch'){
            let checkedLabel = defaultStr(field.checkedLabel,code =='archived'?'Archivé':'Désactivé').toLowerCase().trim(),
            uncheckedLabel = defaultStr(field.uncheckedLabel,code =='archived'?'Non archivé':'Activé').toLowerCase().trim(),
            checkedValue = defaultVal(field.checkedValue,1),uncheckedValue = defaultVal(field.uncheckedValue,0)
            v = (defaultVal(v,field.defaultValue,"")+"").toLowerCase().trim();
            if(v == checkedValue+""){
                v = checkedValue;
            } else if(v == uncheckedValue+""){
                v = uncheckedValue;
            } else if(v == checkedLabel){
                v = checkedValue;
            } else if(v == uncheckedLabel){
                v = uncheckedValue;
            } 
            if(!arrayValueExists([checkedValue,uncheckedValue],v)){
                return labelStr+" doit  l'une des valeur : "+checkedLabel+"/"+uncheckedLabel+"/"+checkedValue+"/"+uncheckedValue;
            }
        }
        if(isFieldSelected && v !== undefined){
            data[code] = v;
        }
    }
    data["has-validate-content-imp"] = true;
    return true;
}