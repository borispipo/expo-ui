import {isNonNullString,isObj,defaultObj} from "$utils";
import {getLoggedUserCode} from "$cauth/utils";
import $session from "$session";

const getSessionKey = sessionName =>{
    const code = defaultStr(getLoggedUserCode());
    return code ? (code+"-"+sessionName) : sessionName;
}

export const get = (sessionName,key)=>{
    const s = !isNonNullString(sessionName)? {}: defaultObj($session.get(getSessionKey(sessionName)));
    if(isNonNullString(key)){
        return s[key] || undefined;
    }
    return s;
}
export const set = (sessionName,key,value)=>{
    const s = get(sessionName);
    value = isNonNullString(key)? {[key]:value}  : isObj(key)? key :  isObj(value)? value : null;
    if(value){
        value = {...s,...value};
        $session.set(getSessionKey(sessionName),value);
        return value;
    }
    return value;
}

export default {get,set};