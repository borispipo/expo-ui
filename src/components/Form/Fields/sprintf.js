import selectors from "./sprintfSelectors";
import {isNonNullString,defaultFunc} from "$utils";

export default  ({value,val,cb,success})=>{
    val = defaultStr(value,val)
    if(!isNonNullString(val)){
        return null;
    } 
    cb = defaultFunc(cb,success);
    let keys = [];
    for(let i in selectors){
        if(!isObj(selectors[i])) continue;
        if(val.contains(i)){
            keys.push(i);
        } else if(val.contains(i.toUpperCase())){
            keys.push(i.toUpperCase())
        }
    }
    let results = {};
    let length = keys.length;
    let index = length;
    let key = undefined
    const next = ()=>{
        index -=1;
        if(index < 0){
            for(let i in results){
                let t = selectors[i.toLowerCase()];
                let replace = results[i];
                let dbName = defaultStr(t.dbName).toLowerCase(), type = defaultStr(t.type).toLowerCase();
                if( dbName !== 'struct_data' && type !== 'field' && type !== 'form'){
                    replace = " #"+defaultStr(t.dbName)+"["+i.ltrim("&").rtrim("&")+"-"+replace+"]".toUpperCase();
                }
                val = val.replaceAll(i,replace.toUpperCase());
            }
            cb(val);
        } else {
            key = keys[index];
            if(!isNonNullString(key)) {return next();}
        }
    }
    next();
}
