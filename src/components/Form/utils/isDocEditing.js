import {isObj,defaultStr} from "$cutils";
export const checkPrimaryKey = (data,f)=>{
    return !(!(f in data) || (data[f] == null) || (!data[f] && typeof data !=='number'));
}

/*** vérifie si le document passé en paramètre est éditable
 * @param {object} data la données à vérifier
 * @param {object| array} les champs sur lesquels se baser pour vérifier si la donénes est une mise à jour
 * @param {func} checkPrimaryKey la foncition permettant de vérifier s'il s'agit d'une clé primaire pour la données courante
 */
const isDocEditing = (data,fields,checkPrimaryKey)=>{
    if(!isObj(data) || !isObjOrArray(fields)) return false;
    let hasPrimaryFields = false;
    let hasValidated = true;
    for(let i in fields){
        const field = fields[i];
        if(typeof checkPrimaryKey =='function') {
            hasPrimaryFields = true;
            if(checkPrimaryKey({field,i,index:i,data}) === false){
                return false;
            }
            continue;
        }
        if(!isObj(field)) continue;
        hasPrimaryFields = true;
        const f = defaultStr(field.field,i);
        if(field.primaryKey === true){
            if(!checkPrimaryKey(data,f)){
                if(hasPrimaryFields){
                    return false;
                }
                hasValidated = false;
            }
        }
    }
    if(hasPrimaryFields){
        return hasValidated;
    }
    return false;
}

export default isDocEditing;

export const isDocUpdate = isDocEditing;