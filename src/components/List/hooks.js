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
    contextRef.prevItems = React.usePrevious(items);
    const getItems = React.useCallback(()=>{
        if(items === context.prevItems && context.items) {
            return context.items;
        }
        return context.prepareItems(items,filter);
    },[items]);
    context.items = contextRef.items = prepareItems === false ? items : getItems();
    if(!Array.isArray(context.items)){
        console.error(context.items," is not valid list data array",items,props);
        context.items = [];
    }
    return context;
}