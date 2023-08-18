import React from "$react";
import { prepareItems as customPrepareItems} from "./utils";
import {defaultFunc} from "$cutils";

/**** retourne le contexte associé au composant List
    
*/
export const useList = ({items,filter,prepareItems,...props})=>{
    const contextRef = React.useRef({itemsRefs:[]});
    const context = contextRef.current;
    context.itemsRefs = Array.isArray(context.itemsRefs) && context.itemsRefs || [];
    context.prepareItems = defaultFunc((prepareItems === false ? (items)=> items:null),prepareItems,customPrepareItems);
    const canPrepareItems = prepareItems === false ? false : true;
    context.items = contextRef.items = React.useMemo(()=>{
        const r = context.prepareItems(items,filter);
        if(!Array.isArray(r)){
            console.error(r," is not valid list data array",items,props);
            return [];
        }
        return r;
    },[items,canPrepareItems]);
    return context;
}