import {defaultStr} from "$cutils";

export const MIN_HEIGHT = 50;

const defaultFilter = x=>true;
export const prepareItems = (items,filter)=>{
    if(typeof filter !=='function'){
        if(Array.isArray(items)) return items;
        filter = defaultFilter;
    }
    const _items = [];
    Object.map(items,(item,index,_index)=>{
        if(filter({item,index,_index}) ===false) return null;
        _items.push(item);
    })
    return _items;
};
export const getBToTopRef = (bToTop)=>{
    if(!isObj(bToTop)) return null;
    return typeof bToTop.toggleVisibility === 'function'? bToTop : 
        bToTop.current && typeof bToTop.current =='object' && typeof bToTop.current.toggleVisibility  =='function' ? bToTop.current : 
        null;
}
