import {isObj,isNonNullString,isFunction,defaultObj,extendObj,defaultBool} from "$cutils";
import APP from "$capp/instance";
import {observable,addObserver,isObservable} from "$observable";

let MANAGER = {
    forms : {
        
    },///les actions de formulaire
    actions : {

    },
};
if(!isObj(APP.FormsManager)){
    Object.defineProperties(APP,{
        FormsManager : {
            value : MANAGER,
            writable:false,
            override : false
        }
    });
    observable(APP.FormsManager);
    addObserver(APP.FormsManager);
    APP.FormsManager.on("mount",(formName,formObject)=>{
        formObject._fields = defaultObj(formObject._fields);
        formObject._actions= defaultObj(formObject._actions);
        APP.FormsManager.forms[formName] = formObject;
        APP.trigger("MOUNT_FORM",formName);
    }).on("unmount",(formName)=>{
        delete APP.FormsManager.forms[formName];
    }).on("registerField",(fieldName,formName,fieldObj)=>{
        if(fieldObj && isObservable(fieldObj)){
            APP.FormsManager.forms[formName] = defaultObj(APP.FormsManager.forms[formName]);
            APP.FormsManager.forms[formName]._fields = defaultObj(APP.FormsManager.forms[formName]._fields);
            APP.FormsManager.forms[formName]._fields[fieldName] = fieldObj;
            let form = APP.FormsManager.forms[formName];
            let formField = form._fields[fieldName];
            if(isFunction(formField.onRegister)) formField.onRegister(fieldName,fieldObj);
        }
    }).on("unregisterField",(fieldName,formName)=>{
        if(isNonNullString(fieldName) && isNonNullString(formName)){
            APP.FormsManager.forms[formName] = defaultObj(APP.FormsManager.forms[formName]);
            APP.FormsManager.forms[formName]._fields = defaultObj(APP.FormsManager.forms[formName]._fields);
            delete APP.FormsManager.forms[formName]._fields[fieldName];
        }
    }).on("mountAction",(formName,actionObj)=>{
        if(!isNonNullString(formName) || !isObj(actionObj)) {
            console.error("MSForm Action, l'action, nom du formulaire non définit ",formName,actionObj)
            return;
        }
        APP.FormsManager.actions = defaultObj(APP.FormsManager.actions);
        APP.FormsManager.actions[formName] = defaultObj(APP.FormsManager.actions[formName]);
        APP.FormsManager.actions[formName][actionObj.getId()] = actionObj;
    }).on("unmountAction",(formName,actionId)=>{
        if(!isNonNullString(formName) || !isNonNullString(actionId)) return;
        if(!isObj(APP.FormsManager.actions) || !isObj(APP.FormsManager.actions[formName])) return;
        delete APP.FormsManager.actions[formName][actionId]
    })
} else {
    MANAGER = APP.FormsManager;
}

export default MANAGER;

export const getFormInstance = (formName) =>{
    return MANAGER.forms[formName];
}
export const getForm = getFormInstance;


export const getFormFields = (formName)=>{
    if(!isNonNullString(formName)) return {};
    if(!isObj(APP.FormsManager.forms[formName]) || !isObj(APP.FormsManager.forms[formName]._fields))return {};
    return APP.FormsManager.forms[formName]._fields;
}

/*** retourne l'instance d'un champ à partir du nom du formulaire et celui du champ en question
 * @param : formName : le nom de la form dans lequel est définit le cham
 * @parm f: string field name : le nom du champ à récupérer 
 */
 export const getFormField = (formName,fieldName)=>{
    if(!isNonNullString(formName)||!isNonNullString(fieldName)) return null;
    let fields = getFormFields(formName);
    if(isObj(fields)){
        return fields[fieldName];
    }
    return null;
}
export const getFormData = (formName)=>{
    const instance = getForm(formName);
    if(instance) return instance.getData();
    return {};
}

export const getActions = (formName) =>{
    if(!isNonNullString(formName)) return {};
    if(!isObj(APP.FormsManager.actions)) return {} ;
    return defaultObj(APP.FormsManager.actions[formName]);
}

export const warning = (payload,msg) => {if(!isNonNullString(msg)) msg = "⚠ Forms, Missing field name";else msg = "⚠ Forms, "+msg;console.warn(`⚠ Forms, Missing field name: ${payload}`);}


