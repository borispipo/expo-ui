import React from "$react";
import {isNonNullString,defaultStr} from "$cutils";
import apiSession from "./session";
export const useSession = (sessionName)=>{
    sessionName = defaultStr(sessionName);
    const sessionRef = React.useRef({});
    return React.useStableMemo(()=>{
        if(sessionName){
            return {
                sessionName,
                get name(){
                    return sessionName;
                },
                get : (a,b)=> {
                    return apiSession.get(sessionName,a,b);
                },
                set : (a,b)=>{
                    return apiSession.set(sessionName,a,b);
                }
            }
        }
        return {
          sessionName,
          get name(){
            return sessionName;
          },
          get: key => {
            if(isNonNullString(key)) return sessionRef.current[key];
            return sessionRef.current;
          },
          set:(key,value)=>{
              if(isObj(key)){
                sessionRef.current = {...sessionRef.current,...key}
              } else if(isNonNullString(key)) {
                sessionRef.current[key] = value;
              }
              return sessionRef.current;
          }
        };
    },[sessionName]);
}