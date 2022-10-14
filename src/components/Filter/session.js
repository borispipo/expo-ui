import session from "$session";
import {getLoggedUserCode} from "$cauth";
const sKey = "FILTER-ITEM-KEY";
const sessionKey = ()=> defaultStr(getLoggedUserCode())+"-"+sKey;
import {defaultObj,defaultStr,isNonNullString} from "$utils";

export const getSessionData = (key)=>{
  const data = defaultObj(session.get(sessionKey()));
  return isNonNullString(key)? data [key] : data;
}
export const setSessionData = (key,value)=>{
  const data = getSessionData();
  if(isNonNullString(key)){
    data[key] = value;
    return session.set(sessionKey(),data);
  }
  return false;
}