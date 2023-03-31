import {showPrompt,notify} from "$ecomponents/Dialog";
import {defaultFunc,isNonNullString,defaultDecimal} from "$cutils";
import APP from "$capp/instance";

const setDatagridQueryLimit = (limit,successCB,errorCB)=>{
    successCB = defaultFunc(successCB);
    limit = defaultDecimal(limit);
    showPrompt({
        title : 'Limite du nombre d\'éléments de la liste',
        placeholder : limit,
        defaultValue : limit,
        type : "number",
        yes : 'Définir',
        no : 'Annuler',
        onSuccess : ({value})=>{
            if(isNonNullString(value)){
                value = parseInt(value);
            }
            value = defaultDecimal(value);
            if(value < 0) {
                return notify.error("Vous devez entrer un nombre supérieur ou égal à zéro");
            }
            successCB(value);
            if(value !== limit){
                APP.trigger(APP.EVENTS.SET_DATAGRID_QUERY_LIMIT,value);
            }
        },
        onError : errorCB
    })
}

export default setDatagridQueryLimit;