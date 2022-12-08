import Dimensions,{isDesktopMedia} from "$cdimensions";

export * from "./DrawerItems/utils";

let activeItem = null;
export const getActiveItem = x=> activeItem;
export {default as session} from "./session";

const DRAWER_WIDTH = 320;
const DESKTOP_DRAWER_WIDTH = 280;

export const getDrawerWidth = ()=>{
    if(isDesktopMedia()) return DESKTOP_DRAWER_WIDTH;
    const {width} = Dimensions.get("window");
    if(width > DRAWER_WIDTH + 100) return DRAWER_WIDTH;
    const percent = Math.floor((width <= DRAWER_WIDTH?90:80)*width/100);
    if(width <= DESKTOP_DRAWER_WIDTH) return percent;
    return Math.max(percent,DESKTOP_DRAWER_WIDTH);
}

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


export const canBeMinimizedOrPermanent = x=> isDesktopMedia() ? true : false;

