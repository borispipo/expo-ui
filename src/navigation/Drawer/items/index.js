import { isRouteActive} from "$navigation/utils";
import items from "./items";

let CACHED_ITEMS = []

export const refresh = ()=>{
    CACHED_ITEMS = items();
    return CACHED_ITEMS;
}

export default function mainSidebarItems(options){
    if(!CACHED_ITEMS.length){
        refresh();
    }
    return CACHED_ITEMS;
};

export const isItemActive = (opts)=>{
    if(isRouteActive(opts)){
        return true;
    }   
    return false;
}