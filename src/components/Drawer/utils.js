import {isMobileNative} from "$platform";
import {isDesktopMedia} from "$dimensions";

export * from "./DrawerItems/utils";

let activeItem = null;
export const getActiveItem = x=> activeItem;
export {default as session} from "./session";

export const DRAWER_WIDTH = isMobileNative()?300:280;

export const MINIMIZED_WIDTH = 85;

export const TRANSITION_TIMEOUT = 150;

export const MINIMIZED_ICON_SIZE = 32;

export const ICON_SIZE = 24;

export const DRAWER_POSITIONS = {
    left : "left",
    right : 'right',
}

export const DRAWER_TYPES = {front:'front', back:'back', slide:'slide'};

export const setActiveItem = (item,toogleActiveItem)=> {
    if(toogleActiveItem ===true && activeItem && activeItem.desactivate){
        activeItem.desactivate();
    }
    activeItem = item;
    if(toogleActiveItem === true && activeItem && activeItem.activate){
        activeItem.activate();
    }
}


export const canBeMinimizedOrPermanent = x=> /*!isMobileNative() && */isDesktopMedia() ? true : false;

