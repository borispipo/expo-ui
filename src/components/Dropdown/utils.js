import {isMobileOrTabletMedia} from "$cplatform/dimensions";
import {isNativeMobile,isTouchDevice} from "$cplatform";

export const matchOperators = /[|\\{}()[\]^$+*?.]/g;

export const SEARCH_TIMEOUT = 1000;

export const MAX_AUTO_FOCUS_ITEMS = 10;

export const getSearchTimeout = (itemCount)=>{
    if(typeof itemCount !=='number') return SEARCH_TIMEOUT;
    return itemCount <= (isMobileOrTabletMedia()? 100 : 1000) ? 0 : SEARCH_TIMEOUT;
}

/**** voir si le champ de recherche du composant peut être autofocus enf onction du nombre d'items et du type d'environnement */
export const canAutoFocusSearchField = ({visible,items})=>{
    const count = typeof items =='number'? items : typeof (items) === 'object' ? Object.size(items) : 0;
    if(!visible) return false;
    const ret = count > MAX_AUTO_FOCUS_ITEMS && true || false;
    if(!isNativeMobile() && !isTouchDevice()) return true;
    return isNativeMobile()? ret : false;
}