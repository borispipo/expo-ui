import {Image} from "react-native";
import { isObj,isDecimal,isNonNullString,isDataURL} from "$cutils";
import { isWeb } from "$cplatform";

export const isAssets = (asset,staticAssets)=>{
    return isObj(asset) && isDecimal(asset.width) && isDecimal(asset.height) && isNonNullString(asset.uri) && (staticAssets ? asset.uri.contains("/static/"):true);
}
export const isValidImageSrc = (src)=>{
    if(!isNonNullString(src)) return false;
    return isDataURL(src) && !src.includes(",undefined") ? true : isValidURL(src) ? true : src.contains("/static/media/")? true  : false;
}
export const resolveAssetSource = (source)=>{
    if(!source && !isDecimal(source)) return undefined;
    try {
        if(isWeb()){
            return {uri:source};
        }
        return Image.resolveAssetSource(source);
    } catch(e){
        console.log(e," triing to resolve image asset from source ",source)
        return undefined;
    }
}
export const getUri = (src,onlySting)=>{
    if(isAssets(src)) return src.uri;
    if(isDecimal(src)){
        if(onlySting !== false){
            return resolveAssetSource(src)?.uri;
        }
        return resolveAssetSource(src);
    }
    if(isObj(src) && isValidImageSrc(src.uri)){
        return src.uri;
    } else if(isValidImageSrc(src)) return src;
    return null;
}
