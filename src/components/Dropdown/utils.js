import {isMobileOrTabletMedia} from "$cplatfrom/dimensions";
import {isNativeMobile} from "$cplatfrom";

export const matchOperators = /[|\\{}()[\]^$+*?.]/g;

export const SEARCH_TIMEOUT = 1500;

export const MAX_AUTO_FOCUS_ITEMS = 10;

export const getSearchTimeout = (itemCount)=>{
    if(typeof itemCount !=='number') return SEARCH_TIMEOUT;
    return itemCount <= (isMobileOrTabletMedia()? 100 : 1000) ? 0 : SEARCH_TIMEOUT;
}

/**** voir si le champ de recherche du composant peut être autofocus enf onction du nombre d'items et du type d'environnement */
export const canAutoFocusSearchField = ({visible,items})=>{
    const count = typeof items =='number'? items : typeof (items) === 'object' ? Object.size(items) : 0;
    return visible && (!isNativeMobile() || count > MAX_AUTO_FOCUS_ITEMS) ? true : false;
}