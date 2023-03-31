import $session from "$session";
import {isNonNullString} from "$cutils";

export const getKey = x => "datagrid-merged-sess-"+defaultStr(Auth.getLoggedUserCode());
export const get = (key)=>{
   let data = defaultObj($session.get(getKey()));
   if(isNonNullString(key)){
       return data[key];
   }
   return data;
}
export const set = (key,value)=>{
    let data = get();
    if(isNonNullString(key)){
        data[key] = value;
    }
    $session.set(getKey(),data);
    return data;
}
export default {get,set,getKey};