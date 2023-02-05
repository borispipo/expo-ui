const postMessage = require("../postMessage");
const callbackRef = {current:null};
const instanceRef = {current:null};
const isValid = APP => APP && typeof APP =='object' && typeof APP.trigger =='function';
const setInstance = (APP)=>{
    if(isValid(APP)){
        instanceRef.current = APP;
        if(typeof callbackRef.current =='function'){
            callbackRef.current(APP);
        }
    }
    callbackRef.current = undefined;
    return instanceRef.current;
}
module.exports = {
    get callback(){
        return callbackRef.current;
    },
    set callback(handler){
        callbackRef.current = handler;
    },
    get get (){
        return (handler,force)=>{
            return new Promise((resolve)=>{
                callbackRef.current = (APP)=>{
                    callbackRef.current = undefined;
                    if(typeof handler =='function'){
                        handler(APP);
                    }
                    instanceRef.current = APP;
                    resolve(APP);
                };
                if(force !== true && handler !==true && isValid(instanceRef.current)){
                   return callbackRef.current(instanceRef.current);
                }
                postMessage("GET_APP_INSTANCE");
            });
        }
    },
    get set (){
        return setInstance;
    },
    set current (APP){
        return setInstance(APP);
    }
}