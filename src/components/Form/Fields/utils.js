import {uniqid} from "$cutils";

export const RENDERED_ID = uniqid("RENDERED-NAME");

export const getRenderedId = (props)=>{
    if(!isObj(props)) return "";
    return props[RENDERED_ID];
}