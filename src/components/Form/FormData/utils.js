import {isNonNullString,isObj,defaultObj,isPromise,isFunction,defaultStr,isObjOrArray,defaultFunc} from "$cutils";
import notify from "$notify";
import { getFormData } from "../utils/FormsManager";
import {isMobileBrowser,isMobileNative} from "$cplatform";
import { keyboardShortcuts as KeyboardShorts } from "../utils";

export const keyboardShortcuts = {};
Object.map(KeyboardShorts,(st,i)=>{
    if(isObj(st) && isNonNullString(st.action)){
        keyboardShortcuts[st.action] = i;
    }
});

export const canHandleShurtCut = x=> !isMobileNative(true) && !isMobileBrowser() ? true : false;

const canHandleS = canHandleShurtCut();
export const getAppBarActionsProps = function(_props){
    let {actions,formName,save,cancel,actionMutator,saveButton,saveButtonIcon,data,style,...props} = defaultObj(_props);
    props = Object.assign({},props);
    cancel = defaultFunc(cancel);
    save = defaultFunc(save);
    saveButton = isNonNullString(saveButton)? saveButton : Object.size(data,true) > 0 && (isNonNullString(data.code) || isNonNullString(data._id))? "Modifier":'Enregister';
    saveButtonIcon = defaultStr(saveButtonIcon,'check')
    if(typeof actions =='function'){
        actions = actions(props);
    }
    if(actions === undefined){
        actions = [{
            formName,
            text : saveButton,
            icon : saveButtonIcon,
            isAction: true,
        }]
    } else {
        actions = (isObjOrArray(actions))?actions : [];
    }
    return {
        ...props,
        formName,
        data,
        actions,
        actionMutator:({action,...rest})=>{
            let  {isAction,canSave,shortcut,onPress,...a} = action;
            action = defaultObj(a);
            if(canHandleS && isNonNullString(shortcut) && isNonNullString(keyboardShortcuts[shortcut])){
                action.tooltip = defaultStr(action.tooltip,action.title,action.text,action.label);
                if(action.tooltip){
                    action.tooltip +=" ("+keyboardShortcuts[shortcut]+")";
                }
            }
            isAction = defaultBool(isAction,canSave,rest.isAction,rest.canSave,true);
            action.formName = formName;
            if(isAction) {
                action.isFormAction = true;
                /*
                    en cas d'action de formulaire, si la fonction onPress retourne false, alors l'enregistrement du formulaire ne sera pas possible
                    la fonction onPress du bouton d'action prend en premier paramètre les paramètres du formulaire, et en second, la fonction save permettant d'enregistrer le formulaire
                    si cette fonction retourne false, alors la fonction save ne sera pas appelée.
                */
                action.onPress = (aArg) =>{
                    const args = {...aArg,data:getFormData(formName),actionElt:action,actionKey:action.key};
                    if(isFunction(onPress) && onPress(args,save) === false){
                        return;
                    }
                    save(args)
                }
            } 
            else {
                delete action.handleChange;
                action.onPress = (event) =>{
                    if(isFunction(onPress) && onPress(event) === false) return;
                    cancel(event);
                }
            }
            return typeof actionMutator =='function'? actionMutator({...rest,action}):action;
    }}
}


/**** permet d'exécuter la fonction before save passée en paramètre en fonction du résultat rétournée*/
export const handleBeforeSaveCallback = (beforeSaveCallback,successCb,arg)=>{
    let bF = typeof beforeSaveCallback =='function'?  beforeSaveCallback(arg) : undefined;
    successCb = typeof successCb =='function'? successCb : x => x;
    if(bF === false) return;
    if(isPromise(bF)){
        bF.then((result)=>{
            if(result === false) return;
            if(isNonNullString(result)){
                notify.error(result);
                return;
            }
            successCb(arg);
        }).catch((e)=>{
            notify.error(e);
        })
        return arg;
    } else if(isNonNullString(bF)){
        notify.error(bF);
        return;
    } 
    successCb(arg);
    return bF;
} 